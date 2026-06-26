import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolSet, jsonSchema } from 'ai';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolRetrievalOptions } from 'src/engine/core-modules/tool-provider/interfaces/tool-retrieval-options.type';

import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { compactToolOutput } from 'src/engine/core-modules/tool-provider/output-transforms/compact-tool-output.util';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type LearnToolsAspect } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { findSimilarToolNames } from 'src/engine/core-modules/tool-provider/utils/find-similar-tool-names.util';
import { wrapWithErrorHandler } from 'src/engine/core-modules/tool-provider/utils/tool-error.util';
import { ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly toolExecutorService: ToolExecutorService,
    private readonly toolOutputSpillService: ToolOutputSpillService,
  ) {}

  async getCatalog(context: ToolProviderContext): Promise<ToolIndexEntry[]> {
    const results = await Promise.all(
      this.providers.map(async (provider) => {
        if (await provider.isAvailable(context)) {
          return provider.generateDescriptors(context, {
            includeSchemas: false,
          });
        }

        return [];
      }),
    );

    return results.flat();
  }

  async resolveSchemas({
    toolNames,
    context,
    precomputedCatalog,
  }: {
    toolNames: string[];
    context: ToolProviderContext;
    precomputedCatalog?: ToolIndexEntry[];
  }): Promise<Map<string, object>> {
    const index = precomputedCatalog ?? (await this.getCatalog(context));
    const nameSet = new Set(toolNames);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    const byCategory = new Map<string, ToolIndexEntry[]>();

    for (const entry of matchingEntries) {
      const existing = byCategory.get(entry.category) ?? [];

      existing.push(entry);
      byCategory.set(entry.category, existing);
    }

    const schemas = new Map<string, object>();

    for (const [category, entries] of byCategory) {
      const provider = this.providers.find(
        (providerItem) => providerItem.category === category,
      );

      if (!provider) {
        continue;
      }

      const entryNameSet = new Set(entries.map((entry) => entry.name));

      const descriptors = await provider.generateDescriptors(context, {
        includeSchemas: true,
        toolNames: entryNameSet,
      });

      for (const descriptor of descriptors) {
        if (
          entryNameSet.has(descriptor.name) &&
          'inputSchema' in descriptor &&
          descriptor.inputSchema
        ) {
          schemas.set(descriptor.name, descriptor.inputSchema);
        }
      }
    }

    return schemas;
  }

  // Hydrate ToolDescriptor[] into an AI SDK ToolSet with thin dispatch closures
  hydrateToolSet(
    descriptors: ToolDescriptor[],
    context: ToolProviderContext,
    options?: {
      wrapWithErrorContext?: boolean;
      compactOutput?: boolean;
      spillLargeOutput?: boolean;
    },
  ): ToolSet {
    const toolSet: ToolSet = {};
    const compactOutput = options?.compactOutput ?? false;
    const spillLargeOutput = options?.spillLargeOutput ?? false;

    for (const descriptor of descriptors) {
      const schema = descriptor.inputSchema as Record<string, unknown>;

      const executeFn = async (
        args: Record<string, unknown>,
      ): Promise<ToolOutput> => {
        const result = await this.toolExecutorService.dispatch(
          descriptor,
          args,
          context,
        );

        const compacted = compactOutput
          ? (compactToolOutput(result) as ToolOutput)
          : result;

        return spillLargeOutput
          ? this.toolOutputSpillService.spillIfTooLarge(
              compacted,
              { workspaceId: context.workspaceId },
              { toolName: descriptor.name },
            )
          : compacted;
      };

      toolSet[descriptor.name] = {
        description: descriptor.description,
        inputSchema: jsonSchema(schema),
        execute: options?.wrapWithErrorContext
          ? wrapWithErrorHandler(descriptor.name, executeFn)
          : executeFn,
      };
    }

    return toolSet;
  }

  async buildToolIndex(
    workspaceId: string,
    roleId: string,
    options?: {
      userId?: string;
      userWorkspaceId?: string;
      locale?: keyof typeof APP_LOCALES;
    },
  ): Promise<ToolIndexEntry[]> {
    const context = this.buildContextFromToolContext({
      workspaceId,
      roleId,
      userId: options?.userId,
      userWorkspaceId: options?.userWorkspaceId,
      locale: options?.locale,
    });

    return this.getCatalog(context);
  }

  async getToolsByName(
    names: string[],
    context: ToolContext,
    options?: {
      compactOutput?: boolean;
      spillLargeOutput?: boolean;
    },
  ): Promise<ToolSet> {
    const fullContext = this.buildContextFromToolContext(context);

    const catalog = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = catalog.filter((entry) => nameSet.has(entry.name));

    const schemas = await this.resolveSchemas({
      toolNames: names,
      context: fullContext,
      precomputedCatalog: catalog,
    });

    const descriptors: ToolDescriptor[] = matchingEntries
      .filter((entry) => schemas.has(entry.name))
      .map((entry) => ({
        ...entry,
        inputSchema: schemas.get(entry.name)!,
      }));

    return this.hydrateToolSet(descriptors, fullContext, {
      compactOutput: options?.compactOutput,
      spillLargeOutput: options?.spillLargeOutput,
    });
  }

  async getToolInfo(
    names: string[],
    context: ToolContext,
    aspects: LearnToolsAspect[] = ['description', 'schema'],
  ): Promise<
    Array<{
      name: string;
      description?: string;
      inputSchema?: object;
    }>
  > {
    const fullContext = this.buildContextFromToolContext(context);

    const catalog = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = catalog.filter((entry) => nameSet.has(entry.name));

    let schemas: Map<string, object> | undefined;

    if (aspects.includes('schema')) {
      schemas = await this.resolveSchemas({
        toolNames: names,
        context: fullContext,
        precomputedCatalog: catalog,
      });
    }

    return matchingEntries.map((entry) => {
      const info: {
        name: string;
        description?: string;
        inputSchema?: object;
      } = { name: entry.name };

      if (aspects.includes('description')) {
        info.description = entry.description;
      }

      if (aspects.includes('schema') && schemas) {
        info.inputSchema = schemas.get(entry.name);
      }

      return info;
    });
  }

  async suggestSimilarToolNames(
    toolNames: string[],
    context: ToolContext,
  ): Promise<Record<string, string[]>> {
    const fullContext = this.buildContextFromToolContext(context);

    const catalog = await this.getCatalog(fullContext);
    const candidateToolNames = catalog.map((entry) => entry.name);

    const suggestionsByToolName: Record<string, string[]> = {};

    for (const toolName of toolNames) {
      const similarToolNames = findSimilarToolNames(
        toolName,
        candidateToolNames,
      );

      if (similarToolNames.length > 0) {
        suggestionsByToolName[toolName] = similarToolNames;
      }
    }

    return suggestionsByToolName;
  }

  async resolveAndExecute(
    toolName: string,
    args: Record<string, unknown> | undefined,
    context: ToolContext,
    options?: { compactOutput?: boolean; spillLargeOutput?: boolean },
  ): Promise<ToolOutput> {
    try {
      const fullContext = this.buildContextFromToolContext(context);

      const index = await this.getCatalog(fullContext);
      const entry = index.find((indexEntry) => indexEntry.name === toolName);

      if (!entry) {
        const similarToolNames = findSimilarToolNames(
          toolName,
          index.map((indexEntry) => indexEntry.name),
        );
        const suggestionHint =
          similarToolNames.length > 0
            ? ` Did you mean: ${similarToolNames.join(', ')}?`
            : '';

        return {
          success: false,
          message: `Tool "${toolName}" not found`,
          error: `Tool "${toolName}" not found.${suggestionHint} Use learn_tools to discover available tools.`,
        };
      }

      const result = await this.toolExecutorService.dispatch(
        entry,
        args,
        fullContext,
      );

      const compacted = options?.compactOutput
        ? (compactToolOutput(result) as ToolOutput)
        : result;

      return options?.spillLargeOutput
        ? this.toolOutputSpillService.spillIfTooLarge(
            compacted,
            { workspaceId: fullContext.workspaceId },
            { toolName },
          )
        : compacted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Error executing tool "${toolName}": ${errorMessage}`);

      return {
        success: false,
        message: `Failed to execute ${toolName}`,
        error: errorMessage,
      };
    }
  }

  // Eager loading tools by categories (MCP, workflow agent).
  // These paths need full schemas, so generate with includeSchemas: true.
  async getToolsByCategories(
    context: ToolProviderContext,
    options: ToolRetrievalOptions = {},
  ): Promise<ToolSet> {
    const {
      categories,
      excludeTools,
      wrapWithErrorContext,
      compactOutput,
      spillLargeOutput,
    } = options;
    const categorySet = categories ? new Set(categories) : undefined;

    const results = await Promise.all(
      this.providers
        .filter(
          (provider) => !categorySet || categorySet.has(provider.category),
        )
        .map(async (provider) => {
          if (await provider.isAvailable(context)) {
            return provider.generateDescriptors(context, {
              includeSchemas: true,
            });
          }

          return [];
        }),
    );

    const descriptors = results.flat() as ToolDescriptor[];

    let filteredDescriptors = descriptors;

    if (excludeTools?.length) {
      const excludeSet = new Set(excludeTools);

      filteredDescriptors = filteredDescriptors.filter(
        (descriptor) => !excludeSet.has(descriptor.name),
      );
    }

    const toolSet = this.hydrateToolSet(filteredDescriptors, context, {
      wrapWithErrorContext,
      compactOutput,
      spillLargeOutput,
    });

    this.logger.log(
      `Generated ${Object.keys(toolSet).length} tools for categories: [${categories?.join(', ') ?? 'all'}]`,
    );

    return toolSet;
  }

  private buildContextFromToolContext(
    context: ToolContext,
  ): ToolProviderContext {
    const rolePermissionConfig: RolePermissionConfig = {
      unionOf: [context.roleId],
    };

    console.log('context.actorContext', context.actorContext);

    return {
      workspaceId: context.workspaceId,
      roleId: context.roleId,
      rolePermissionConfig,
      authContext: context.authContext,
      actorContext: context.actorContext,
      userId: context.userId,
      userWorkspaceId: context.userWorkspaceId,
      threadId: context.threadId,
      locale: context.locale,
      onCodeExecutionUpdate: context.onCodeExecutionUpdate,
    };
  }
}

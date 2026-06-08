import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolSet, jsonSchema } from 'ai';

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
import { wrapWithErrorHandler } from 'src/engine/core-modules/tool-provider/utils/tool-error.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  stripLoadingMessage,
  wrapJsonSchemaForExecution,
} from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly toolExecutorService: ToolExecutorService,
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

  // Enumerate every tool name the workspace could expose, ignoring the
  // caller's role permissions and the per-provider `isAvailable` gate. Used to
  // tell "exists but forbidden" apart from "does not exist" when a lookup
  // misses the permission-filtered catalog. This never produces an executable
  // catalog — names only.
  private async getUnrestrictedToolNames(
    context: ToolProviderContext,
  ): Promise<Set<string>> {
    const results = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const descriptors = await provider.generateDescriptors(context, {
            includeSchemas: false,
            ignorePermissions: true,
          });

          return descriptors.map((descriptor) => descriptor.name);
        } catch (error) {
          this.logger.warn(
            `Failed to enumerate unrestricted tools for provider "${provider.category}": ${
              error instanceof Error ? error.message : String(error)
            }`,
          );

          return [];
        }
      }),
    );

    return new Set(results.flat());
  }

  // Split tool names the caller cannot currently use into those that exist in
  // the workspace but are blocked by permissions ("forbidden") and those that
  // do not exist at all ("notFound").
  async classifyUnavailableTools(
    names: string[],
    context: ToolContext,
  ): Promise<{ forbidden: string[]; notFound: string[] }> {
    if (names.length === 0) {
      return { forbidden: [], notFound: [] };
    }

    const fullContext = this.buildContextFromToolContext(context);
    const unrestrictedNames = await this.getUnrestrictedToolNames(fullContext);

    const forbidden: string[] = [];
    const notFound: string[] = [];

    for (const name of names) {
      if (unrestrictedNames.has(name)) {
        forbidden.push(name);
      } else {
        notFound.push(name);
      }
    }

    return { forbidden, notFound };
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
      includeLoadingMessage?: boolean;
      compactOutput?: boolean;
    },
  ): ToolSet {
    const toolSet: ToolSet = {};
    const includeLoadingMessage = options?.includeLoadingMessage ?? true;
    const compactOutput = options?.compactOutput ?? false;

    for (const descriptor of descriptors) {
      const baseSchema = descriptor.inputSchema as Record<string, unknown>;
      const schema = includeLoadingMessage
        ? wrapJsonSchemaForExecution(baseSchema)
        : baseSchema;

      const executeFn = async (
        args: Record<string, unknown>,
      ): Promise<ToolOutput> => {
        const cleanArgs = includeLoadingMessage
          ? stripLoadingMessage(args ?? {})
          : (args ?? {});

        const result = await this.toolExecutorService.dispatch(
          descriptor,
          cleanArgs,
          context,
        );

        return compactOutput
          ? (compactToolOutput(result) as ToolOutput)
          : result;
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
    options?: { userId?: string; userWorkspaceId?: string },
  ): Promise<ToolIndexEntry[]> {
    const context = this.buildContextFromToolContext({
      workspaceId,
      roleId,
      userId: options?.userId,
      userWorkspaceId: options?.userWorkspaceId,
    });

    return this.getCatalog(context);
  }

  async getToolsByName(
    names: string[],
    context: ToolContext,
    options?: {
      includeLoadingMessage?: boolean;
      compactOutput?: boolean;
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
      includeLoadingMessage: options?.includeLoadingMessage,
      compactOutput: options?.compactOutput,
    });
  }

  async getToolInfo(
    names: string[],
    context: ToolContext,
    aspects: LearnToolsAspect[] = ['description', 'schema'],
  ): Promise<
    Array<{ name: string; description?: string; inputSchema?: object }>
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

  async resolveAndExecute(
    toolName: string,
    args: Record<string, unknown> | undefined,
    context: ToolContext,
    options?: { compactOutput?: boolean },
  ): Promise<ToolOutput> {
    try {
      const fullContext = this.buildContextFromToolContext(context);

      const index = await this.getCatalog(fullContext);
      const entry = index.find((indexEntry) => indexEntry.name === toolName);

      if (!entry) {
        const unrestrictedNames =
          await this.getUnrestrictedToolNames(fullContext);

        if (unrestrictedNames.has(toolName)) {
          return {
            success: false,
            message: `Tool "${toolName}" is not permitted`,
            error: `Tool "${toolName}" exists in this workspace but your role does not have permission to use it. Ask a workspace admin to grant access if you need it.`,
          };
        }

        return {
          success: false,
          message: `Tool "${toolName}" not found`,
          error: `Tool "${toolName}" not found. Use learn_tools to discover available tools.`,
        };
      }

      const result = await this.toolExecutorService.dispatch(
        entry,
        args,
        fullContext,
      );

      return options?.compactOutput
        ? (compactToolOutput(result) as ToolOutput)
        : result;
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
      includeLoadingMessage,
      compactOutput,
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
      includeLoadingMessage,
      compactOutput,
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

    return {
      workspaceId: context.workspaceId,
      roleId: context.roleId,
      rolePermissionConfig,
      authContext: context.authContext,
      userId: context.userId,
      userWorkspaceId: context.userWorkspaceId,
      onCodeExecutionUpdate: context.onCodeExecutionUpdate,
    };
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolCallOptions, type ToolSet, jsonSchema } from 'ai';

import {
  type CodeExecutionStreamEmitter,
  type NativeToolProvider,
  type ToolProvider,
  type ToolProviderContext,
  type ToolRetrievalOptions,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { compactToolOutput } from 'src/engine/core-modules/tool-provider/output-serialization/compact-tool-output.util';
import { NativeModelToolProvider } from 'src/engine/core-modules/tool-provider/providers/native-model-tool.provider';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ExecuteToolResult } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type LearnToolsAspect } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import {
  type ToolDescriptor,
  type ToolIndexEntry,
} from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import {
  generateErrorSuggestion,
  wrapWithErrorHandler,
} from 'src/engine/core-modules/tool-provider/utils/tool-error.util';
import { wrapJsonSchemaForExecution } from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly nativeModelToolProvider: NativeModelToolProvider,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  // Returns ToolIndexEntry[] (lightweight, no schemas).
  // Underlying data (metadata, permissions) is already cached by WorkspaceCacheService.
  // Providers run in parallel since they are independent.
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

  // On-demand schema generation for specific tools
  async resolveSchemas(
    toolNames: string[],
    context: ToolProviderContext,
  ): Promise<Map<string, object>> {
    const index = await this.getCatalog(context);
    const nameSet = new Set(toolNames);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    // Group matching entries by provider category
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

      const fullDescriptors = await provider.generateDescriptors(context, {
        includeSchemas: true,
      });

      const entryNameSet = new Set(entries.map((entry) => entry.name));

      for (const descriptor of fullDescriptors) {
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
    options?: { wrapWithErrorContext?: boolean },
  ): ToolSet {
    const toolSet: ToolSet = {};

    for (const descriptor of descriptors) {
      const schemaWithLoading = wrapJsonSchemaForExecution(
        descriptor.inputSchema as Record<string, unknown>,
      );

      const executeFn = async (
        args: Record<string, unknown>,
      ): Promise<unknown> =>
        this.toolExecutorService.dispatch(descriptor, args, context);

      toolSet[descriptor.name] = {
        description: descriptor.description,
        inputSchema: jsonSchema(schemaWithLoading),
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
    const context = this.buildContext(
      workspaceId,
      roleId,
      undefined,
      options?.userId,
      options?.userWorkspaceId,
    );

    return this.getCatalog(context);
  }

  async getToolsByName(
    names: string[],
    context: ToolContext,
  ): Promise<ToolSet> {
    const fullContext = this.buildContext(
      context.workspaceId,
      context.roleId,
      context.onCodeExecutionUpdate,
      context.userId,
      context.userWorkspaceId,
    );

    const index = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    const schemas = await this.resolveSchemas(names, fullContext);

    const descriptors: ToolDescriptor[] = matchingEntries
      .filter((entry) => schemas.has(entry.name))
      .map((entry) => ({
        ...entry,
        inputSchema: schemas.get(entry.name)!,
      }));

    return this.hydrateToolSet(descriptors, fullContext);
  }

  async getToolInfo(
    names: string[],
    context: ToolContext,
    aspects: LearnToolsAspect[] = ['description', 'schema'],
  ): Promise<
    Array<{ name: string; description?: string; inputSchema?: object }>
  > {
    const fullContext = this.buildContext(
      context.workspaceId,
      context.roleId,
      context.onCodeExecutionUpdate,
      context.userId,
      context.userWorkspaceId,
    );

    const index = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    let schemas: Map<string, object> | undefined;

    if (aspects.includes('schema')) {
      schemas = await this.resolveSchemas(names, fullContext);
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
    args: Record<string, unknown>,
    context: ToolContext,
    _options: ToolCallOptions,
  ): Promise<ExecuteToolResult> {
    try {
      const fullContext = this.buildContext(
        context.workspaceId,
        context.roleId,
        context.onCodeExecutionUpdate,
        context.userId,
        context.userWorkspaceId,
      );

      const index = await this.getCatalog(fullContext);
      const entry = index.find((indexEntry) => indexEntry.name === toolName);

      if (!entry) {
        return {
          toolName,
          error: {
            message: `Tool "${toolName}" not found. Check the tool catalog for correct names.`,
            suggestion:
              'Use learn_tools to discover available tools and their correct names.',
          },
        };
      }

      const result = await this.toolExecutorService.dispatch(
        entry,
        args,
        fullContext,
      );

      return {
        toolName,
        result: compactToolOutput(result),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Error executing tool "${toolName}": ${errorMessage}`);

      return {
        toolName,
        error: {
          message: errorMessage,
          suggestion: generateErrorSuggestion(toolName, errorMessage),
        },
      };
    }
  }

  // Eager loading tools by categories (MCP, workflow agent).
  // These paths need full schemas, so generate with includeSchemas: true.
  async getToolsByCategories(
    context: ToolProviderContext,
    options: ToolRetrievalOptions = {},
  ): Promise<ToolSet> {
    const { categories, excludeTools, wrapWithErrorContext } = options;
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
    });

    if (categories?.includes(ToolCategory.NATIVE_MODEL)) {
      if (await this.nativeModelToolProvider.isAvailable(context)) {
        const nativeTools = await (
          this.nativeModelToolProvider as NativeToolProvider
        ).generateTools(context);

        Object.assign(toolSet, nativeTools);
      }
    }

    this.logger.log(
      `Generated ${Object.keys(toolSet).length} tools for categories: [${categories?.join(', ') ?? 'all'}]`,
    );

    return toolSet;
  }

  private buildContext(
    workspaceId: string,
    roleId: string,
    onCodeExecutionUpdate?: CodeExecutionStreamEmitter,
    userId?: string,
    userWorkspaceId?: string,
  ): ToolProviderContext {
    const rolePermissionConfig: RolePermissionConfig = {
      unionOf: [roleId],
    };

    return {
      workspaceId,
      roleId,
      rolePermissionConfig,
      userId,
      userWorkspaceId,
      onCodeExecutionUpdate,
    };
  }
}

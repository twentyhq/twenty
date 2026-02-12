import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolCallOptions, type ToolSet, jsonSchema } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

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
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ExecuteToolResult } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type LearnToolsAspect } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { wrapJsonSchemaForExecution } from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { NativeModelToolProvider } from 'src/engine/core-modules/tool-provider/providers/native-model-tool.provider';

// Backward-compatible alias -- consumers can import this instead of ToolDescriptor
export type ToolIndexEntry = ToolDescriptor;

export type ToolSearchOptions = {
  limit?: number;
  category?: ToolCategory;
};

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

const RAM_TTL_MS = 5_000;
const REDIS_TTL_MS = 300_000;

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  // Two-tier cache: RAM (5s) → Redis (5min) → generate from providers
  private readonly ramCache = new Map<
    string,
    { descriptors: ToolDescriptor[]; cachedAt: number }
  >();

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly nativeModelToolProvider: NativeModelToolProvider,
    private readonly toolExecutorService: ToolExecutorService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  // Core: returns cached ToolDescriptor[] for a workspace+role+user
  async getCatalog(context: ToolProviderContext): Promise<ToolDescriptor[]> {
    const cacheKey = await this.buildCacheKey(context);

    // 1. RAM hit?
    const ramEntry = this.ramCache.get(cacheKey);

    if (ramEntry && Date.now() - ramEntry.cachedAt < RAM_TTL_MS) {
      return ramEntry.descriptors;
    }

    // 2. Redis hit?
    const redisData =
      await this.workspaceCacheStorageService.getToolCatalog(cacheKey);

    if (redisData) {
      const descriptors = redisData as ToolDescriptor[];

      this.ramCache.set(cacheKey, {
        descriptors,
        cachedAt: Date.now(),
      });

      return descriptors;
    }

    // 3. Generate from providers (cache miss)
    const descriptors: ToolDescriptor[] = [];

    for (const provider of this.providers) {
      if (await provider.isAvailable(context)) {
        const providerDescriptors = await provider.generateDescriptors(context);

        descriptors.push(...providerDescriptors);
      }
    }

    this.logger.log(
      `Generated ${descriptors.length} tool descriptors for workspace ${context.workspaceId}`,
    );

    // Store in both caches
    this.ramCache.set(cacheKey, {
      descriptors,
      cachedAt: Date.now(),
    });

    await this.workspaceCacheStorageService.setToolCatalog(
      cacheKey,
      descriptors,
      REDIS_TTL_MS,
    );

    return descriptors;
  }

  // Hydrate ToolDescriptor[] into an AI SDK ToolSet with thin dispatch closures
  hydrateToolSet(
    descriptors: ToolDescriptor[],
    context: ToolProviderContext,
    options?: { wrapWithErrorContext?: boolean },
  ): ToolSet {
    const toolSet: ToolSet = {};

    for (const descriptor of descriptors) {
      // Add loadingMessage to the clean stored schema
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
          ? this.wrapWithErrorHandler(descriptor.name, executeFn)
          : executeFn,
      };
    }

    return toolSet;
  }

  async buildToolIndex(
    workspaceId: string,
    roleId: string,
    options?: { userId?: string; userWorkspaceId?: string },
  ): Promise<ToolDescriptor[]> {
    const context = this.buildContext(
      workspaceId,
      roleId,
      undefined,
      options?.userId,
      options?.userWorkspaceId,
    );

    return this.getCatalog(context);
  }

  async searchTools(
    query: string,
    workspaceId: string,
    roleId: string,
    options: ToolSearchOptions & {
      userId?: string;
      userWorkspaceId?: string;
    } = {},
  ): Promise<ToolDescriptor[]> {
    const { limit = 5, category, userId, userWorkspaceId } = options;
    const context = this.buildContext(
      workspaceId,
      roleId,
      undefined,
      userId,
      userWorkspaceId,
    );

    const descriptors = await this.getCatalog(context);

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const scored = descriptors
      .filter((tool) => !category || tool.category === category)
      .map((tool) => {
        let score = 0;
        const nameLower = tool.name.toLowerCase();
        const descLower = tool.description.toLowerCase();
        const objectLower = tool.objectName?.toLowerCase() ?? '';

        if (nameLower.includes(queryLower)) {
          score += 100;
        }

        if (objectLower && queryLower.includes(objectLower)) {
          score += 80;
        }

        for (const term of queryTerms) {
          if (nameLower.includes(term)) {
            score += 30;
          }
          if (objectLower.includes(term)) {
            score += 25;
          }
          if (descLower.includes(term)) {
            score += 10;
          }
        }

        const operations = ['find', 'create', 'update', 'delete', 'search'];

        for (const op of operations) {
          if (queryLower.includes(op) && nameLower.includes(op)) {
            score += 40;
          }
        }

        return { tool, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.tool);

    this.logger.log(
      `Tool search for "${query}" returned ${scored.length} results`,
    );

    return scored;
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

    const descriptors = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const filtered = descriptors.filter((descriptor) =>
      nameSet.has(descriptor.name),
    );

    return this.hydrateToolSet(filtered, fullContext);
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

    const descriptors = await this.getCatalog(fullContext);

    const nameSet = new Set(names);
    const filtered = descriptors.filter((entry) => nameSet.has(entry.name));

    return filtered.map((entry) => {
      const info: {
        name: string;
        description?: string;
        inputSchema?: object;
      } = { name: entry.name };

      if (aspects.includes('description')) {
        info.description = entry.description;
      }

      if (aspects.includes('schema')) {
        info.inputSchema = entry.inputSchema;
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

      const descriptors = await this.getCatalog(fullContext);
      const descriptor = descriptors.find((desc) => desc.name === toolName);

      if (!descriptor) {
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
        descriptor,
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
          suggestion: this.generateErrorSuggestion(toolName, errorMessage),
        },
      };
    }
  }

  // Main method for eager loading tools by categories
  async getToolsByCategories(
    context: ToolProviderContext,
    options: ToolRetrievalOptions = {},
  ): Promise<ToolSet> {
    const { categories, excludeTools, wrapWithErrorContext } = options;
    const descriptors = await this.getCatalog(context);

    let filteredDescriptors: ToolDescriptor[];

    if (categories) {
      const categorySet = new Set(categories);

      filteredDescriptors = descriptors.filter((descriptor) =>
        categorySet.has(descriptor.category),
      );
    } else {
      filteredDescriptors = [...descriptors];
    }

    // Apply excludeTools filter
    if (excludeTools?.length) {
      const excludeSet = new Set(excludeTools);

      filteredDescriptors = filteredDescriptors.filter(
        (descriptor) => !excludeSet.has(descriptor.name),
      );
    }

    const toolSet = this.hydrateToolSet(filteredDescriptors, context, {
      wrapWithErrorContext,
    });

    // Handle NativeModelToolProvider separately (SDK-opaque tools)
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

  private async buildCacheKey(context: ToolProviderContext): Promise<string> {
    const metadataVersion =
      (await this.workspaceCacheStorageService.getMetadataVersion(
        context.workspaceId,
      )) ?? 0;

    return `${context.workspaceId}:v${metadataVersion}:${context.roleId}:${context.userId ?? 'system'}`;
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

  private wrapWithErrorHandler(
    toolName: string,
    executeFn: (args: Record<string, unknown>) => Promise<unknown>,
  ): (args: Record<string, unknown>) => Promise<unknown> {
    return async (args: Record<string, unknown>) => {
      try {
        return await executeFn(args);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        return {
          success: false,
          error: {
            message: errorMessage,
            tool: toolName,
            suggestion: this.generateErrorSuggestion(toolName, errorMessage),
          },
        };
      }
    };
  }

  private generateErrorSuggestion(
    _toolName: string,
    errorMessage: string,
  ): string {
    const lowerError = errorMessage.toLowerCase();

    if (
      lowerError.includes('not found') ||
      lowerError.includes('does not exist')
    ) {
      return 'Verify the ID or name exists with a search query first';
    }

    if (
      lowerError.includes('permission') ||
      lowerError.includes('forbidden') ||
      lowerError.includes('unauthorized')
    ) {
      return 'This operation requires elevated permissions or a different role';
    }

    if (lowerError.includes('invalid') || lowerError.includes('validation')) {
      return 'Check the tool schema for valid parameter formats and types';
    }

    if (
      lowerError.includes('duplicate') ||
      lowerError.includes('already exists')
    ) {
      return 'A record with this identifier already exists. Try updating instead of creating';
    }

    if (lowerError.includes('required') || lowerError.includes('missing')) {
      return 'Required fields are missing. Check which fields are mandatory for this operation';
    }

    return 'Try adjusting the parameters or using a different approach';
  }
}

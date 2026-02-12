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
import {
  type ToolDescriptor,
  type ToolIndexEntry,
} from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { wrapJsonSchemaForExecution } from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { NativeModelToolProvider } from 'src/engine/core-modules/tool-provider/providers/native-model-tool.provider';

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
const MAX_RAM_ENTRIES = 200;
const MIN_EVICT_ENTRIES = 20;

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  // Two-tier cache: RAM (5s) → Redis (5min) → generate from providers
  // Stores lightweight ToolIndexEntry[] (no schemas) to minimize memory
  private readonly ramCache = new Map<
    string,
    { entries: ToolIndexEntry[]; cachedAt: number }
  >();

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly nativeModelToolProvider: NativeModelToolProvider,
    private readonly toolExecutorService: ToolExecutorService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  // Core: returns cached ToolIndexEntry[] (lightweight, no schemas)
  async getCatalog(context: ToolProviderContext): Promise<ToolIndexEntry[]> {
    this.evictExpiredEntries();

    const cacheKey = await this.buildCacheKey(context);

    // 1. RAM hit?
    const ramEntry = this.ramCache.get(cacheKey);

    if (ramEntry && Date.now() - ramEntry.cachedAt < RAM_TTL_MS) {
      return ramEntry.entries;
    }

    // 2. Redis hit?
    const redisData =
      await this.workspaceCacheStorageService.getToolCatalog(cacheKey);

    if (redisData) {
      const entries = redisData as ToolIndexEntry[];

      this.ramCache.set(cacheKey, {
        entries,
        cachedAt: Date.now(),
      });
      this.evictLRUEntriesIfNeeded();

      return entries;
    }

    // 3. Generate from providers (cache miss) -- no schemas
    const entries: ToolIndexEntry[] = [];

    for (const provider of this.providers) {
      if (await provider.isAvailable(context)) {
        const providerEntries = await provider.generateDescriptors(context, {
          includeSchemas: false,
        });

        entries.push(...providerEntries);
      }
    }

    this.logger.log(
      `Generated ${entries.length} tool index entries for workspace ${context.workspaceId}`,
    );

    // Store in both caches
    this.ramCache.set(cacheKey, {
      entries,
      cachedAt: Date.now(),
    });
    this.evictLRUEntriesIfNeeded();

    await this.workspaceCacheStorageService.setToolCatalog(
      cacheKey,
      entries,
      REDIS_TTL_MS,
    );

    return entries;
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

    // For each category, call the provider with includeSchemas: true
    // and extract only the matching tool schemas
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

    // Get lightweight index and filter to requested names
    const index = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    // Resolve schemas only for the requested tools
    const schemas = await this.resolveSchemas(names, fullContext);

    // Combine into full ToolDescriptor[]
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

    // Get lightweight index for names/descriptions
    const index = await this.getCatalog(fullContext);
    const nameSet = new Set(names);
    const matchingEntries = index.filter((entry) => nameSet.has(entry.name));

    // Only resolve schemas if requested
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

      // Get lightweight index (no schema needed for dispatch)
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
          suggestion: this.generateErrorSuggestion(toolName, errorMessage),
        },
      };
    }
  }

  // Main method for eager loading tools by categories (MCP, workflow agent)
  // These paths need full schemas, so generate with includeSchemas: true
  async getToolsByCategories(
    context: ToolProviderContext,
    options: ToolRetrievalOptions = {},
  ): Promise<ToolSet> {
    const { categories, excludeTools, wrapWithErrorContext } = options;

    // Generate full descriptors with schemas (not cached in lightweight index)
    const descriptors: ToolDescriptor[] = [];

    for (const provider of this.providers) {
      if (categories && !categories.includes(provider.category)) {
        continue;
      }

      if (await provider.isAvailable(context)) {
        const providerDescriptors = await provider.generateDescriptors(
          context,
          { includeSchemas: true },
        );

        descriptors.push(...(providerDescriptors as ToolDescriptor[]));
      }
    }

    let filteredDescriptors = descriptors;

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

    // userId removed -- descriptors do not vary by user
    return `${context.workspaceId}:v${metadataVersion}:${context.roleId}`;
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

  private evictExpiredEntries(): void {
    const now = Date.now();

    for (const [key, value] of this.ramCache) {
      if (now - value.cachedAt >= RAM_TTL_MS) {
        this.ramCache.delete(key);
      }
    }
  }

  private evictLRUEntriesIfNeeded(): void {
    if (this.ramCache.size <= MAX_RAM_ENTRIES) {
      return;
    }

    const sortedEntries = [...this.ramCache.entries()].sort(
      ([, entryA], [, entryB]) => entryA.cachedAt - entryB.cachedAt,
    );

    const toEvict = sortedEntries.slice(0, MIN_EVICT_ENTRIES);

    for (const [key] of toEvict) {
      this.ramCache.delete(key);
    }
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

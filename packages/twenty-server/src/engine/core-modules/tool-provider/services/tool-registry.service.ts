import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolCallOptions, type ToolSet, zodSchema } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { type ZodType } from 'zod';

import {
  type CodeExecutionStreamEmitter,
  type ToolProvider,
  type ToolProviderContext,
  type ToolRetrievalOptions,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { compactToolOutput } from 'src/engine/core-modules/tool-provider/output-serialization/compact-tool-output.util';
import { type ExecuteToolResult } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type LearnToolsAspect } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export type ToolIndexEntry = {
  name: string;
  description: string;
  category:
    | 'DATABASE'
    | 'ACTION'
    | 'WORKFLOW'
    | 'METADATA'
    | 'VIEW'
    | 'DASHBOARD'
    | 'LOGIC_FUNCTION';
  objectName?: string;
  operation?: string;
  inputSchema?: object;
};

export type ToolSearchOptions = {
  limit?: number;
  category?:
    | 'DATABASE'
    | 'ACTION'
    | 'WORKFLOW'
    | 'METADATA'
    | 'VIEW'
    | 'DASHBOARD'
    | 'LOGIC_FUNCTION';
};

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

type CachedToolGeneration = {
  tools: ToolSet;
  index: ToolIndexEntry[];
};

const MEMOIZER_TTL_MS = 60_000;

const PROVIDER_TO_INDEX_CATEGORY: Record<
  ToolCategory,
  ToolIndexEntry['category']
> = {
  DATABASE_CRUD: 'DATABASE',
  ACTION: 'ACTION',
  WORKFLOW: 'WORKFLOW',
  METADATA: 'METADATA',
  NATIVE_MODEL: 'ACTION',
  VIEW: 'VIEW',
  DASHBOARD: 'DASHBOARD',
  LOGIC_FUNCTION: 'LOGIC_FUNCTION',
};

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly memoizer =
    new PromiseMemoizer<CachedToolGeneration>(MEMOIZER_TTL_MS);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  private async getCachedGeneration(
    context: ToolProviderContext,
  ): Promise<CachedToolGeneration> {
    const metadataVersion =
      (await this.workspaceCacheStorageService.getMetadataVersion(
        context.workspaceId,
      )) ?? 0;

    const cacheKey =
      `tools-${context.workspaceId}-v${metadataVersion}-${context.roleId}-${context.userId ?? 'system'}` as const;

    const result = await this.memoizer.memoizePromiseAndExecute(
      cacheKey,
      async () => {
        const tools: ToolSet = {};
        const index: ToolIndexEntry[] = [];

        for (const provider of this.providers) {
          if (await provider.isAvailable(context)) {
            const providerTools = await provider.generateTools(context);

            Object.assign(tools, providerTools);
            index.push(
              ...this.toolSetToIndex(providerTools, provider.category),
            );
          }
        }

        this.logger.log(
          `Generated ${Object.keys(tools).length} tools for workspace ${context.workspaceId} (v${metadataVersion})`,
        );

        return { tools, index };
      },
    );

    return result ?? { tools: {}, index: [] };
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

    const { index } = await this.getCachedGeneration(context);

    return index;
  }

  async searchTools(
    query: string,
    workspaceId: string,
    roleId: string,
    options: ToolSearchOptions & {
      userId?: string;
      userWorkspaceId?: string;
    } = {},
  ): Promise<ToolIndexEntry[]> {
    const { limit = 5, category, userId, userWorkspaceId } = options;
    const context = this.buildContext(
      workspaceId,
      roleId,
      undefined,
      userId,
      userWorkspaceId,
    );

    const { index } = await this.getCachedGeneration(context);

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const scored = index
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

    const { tools } = await this.getCachedGeneration(fullContext);

    return Object.fromEntries(
      names
        .filter((name) => name in tools)
        .map((name) => [name, tools[name]]),
    );
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

    const { index } = await this.getCachedGeneration(fullContext);

    const nameSet = new Set(names);
    const filtered = index.filter((entry) => nameSet.has(entry.name));

    return filtered.map((entry) => {
      const info: { name: string; description?: string; inputSchema?: object } =
        { name: entry.name };

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
    options: ToolCallOptions,
  ): Promise<ExecuteToolResult> {
    try {
      const fullContext = this.buildContext(
        context.workspaceId,
        context.roleId,
        context.onCodeExecutionUpdate,
        context.userId,
        context.userWorkspaceId,
      );

      const { tools } = await this.getCachedGeneration(fullContext);
      const tool = tools[toolName];

      if (!tool) {
        return {
          toolName,
          error: {
            message: `Tool "${toolName}" not found. Check the tool catalog for correct names.`,
            suggestion:
              'Use learn_tools to discover available tools and their correct names.',
          },
        };
      }

      if (!tool.execute) {
        return {
          toolName,
          error: {
            message: `Tool "${toolName}" does not have an execute function.`,
            suggestion:
              'This tool may be a provider-only tool (e.g. web_search).',
          },
        };
      }

      const result = await tool.execute(args, options);

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

  // Main method for eager loading tools by categories (replaces ToolProviderService.getTools)
  async getToolsByCategories(
    context: ToolProviderContext,
    options: ToolRetrievalOptions = {},
  ): Promise<ToolSet> {
    const { categories, excludeTools, wrapWithErrorContext } = options;
    const { tools, index } = await this.getCachedGeneration(context);

    let filteredTools: ToolSet;

    if (categories) {
      const indexCategories = new Set(
        categories.map((category) => PROVIDER_TO_INDEX_CATEGORY[category]),
      );
      const allowedNames = new Set(
        index
          .filter((entry) => indexCategories.has(entry.category))
          .map((entry) => entry.name),
      );

      filteredTools = Object.fromEntries(
        Object.entries(tools).filter(([name]) => allowedNames.has(name)),
      );
    } else {
      filteredTools = { ...tools };
    }

    // Apply excludeTools filter
    if (excludeTools?.length) {
      for (const toolType of excludeTools) {
        delete filteredTools[toolType.toLowerCase()];
      }
    }

    this.logger.log(
      `Generated ${Object.keys(filteredTools).length} tools for categories: [${categories?.join(', ') ?? 'all'}]`,
    );

    // Apply error wrapping if requested
    if (wrapWithErrorContext) {
      return this.wrapToolsWithErrorContext(filteredTools);
    }

    return filteredTools;
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

  private toolSetToIndex(
    tools: ToolSet,
    category: ToolCategory,
  ): ToolIndexEntry[] {
    return Object.entries(tools).map(([name, tool]) => {
      const inputSchema = this.extractJsonSchema(tool.inputSchema);

      return {
        name,
        description: tool.description ?? '',
        category: PROVIDER_TO_INDEX_CATEGORY[category],
        inputSchema,
      };
    });
  }

  private extractJsonSchema(inputSchema: unknown): object | undefined {
    if (!inputSchema) {
      return undefined;
    }

    let schema: object | undefined;

    // Check if it's a Zod schema (has _def property)
    if (
      typeof inputSchema === 'object' &&
      inputSchema !== null &&
      '_def' in inputSchema
    ) {
      try {
        // Use AI SDK's zodSchema() to convert Zod to JSON Schema
        const converted = zodSchema(inputSchema as ZodType);

        schema = converted.jsonSchema as object;
      } catch {
        // If conversion fails, return undefined
        return undefined;
      }
    } else if (
      // Check if AI SDK wrapped it with jsonSchema property
      typeof inputSchema === 'object' &&
      inputSchema !== null &&
      'jsonSchema' in inputSchema
    ) {
      schema = (inputSchema as { jsonSchema: object }).jsonSchema;
    } else if (typeof inputSchema === 'object') {
      // Return as-is if it's already an object (plain JSON schema)
      schema = inputSchema as object;
    }

    if (!schema) {
      return undefined;
    }

    return this.stripInternalFieldsFromSchema(schema);
  }

  // Remove internal fields (loadingMessage) from schema for display
  private stripInternalFieldsFromSchema(schema: object): object {
    const schemaObj = schema as Record<string, unknown>;

    // Remove $schema property
    const { $schema: _, ...rest } = schemaObj;

    // Remove loadingMessage from properties if present
    // loadingMessage is an internal field auto-injected for AI status updates
    if (
      rest.type === 'object' &&
      rest.properties &&
      typeof rest.properties === 'object'
    ) {
      const properties = rest.properties as Record<string, unknown>;
      const { loadingMessage: __, ...cleanProperties } = properties;

      // Filter required array to remove loadingMessage if present
      const required = Array.isArray(rest.required)
        ? rest.required.filter((field) => field !== 'loadingMessage')
        : undefined;

      return {
        ...rest,
        properties: cleanProperties,
        ...(required && required.length > 0 ? { required } : {}),
      };
    }

    return rest;
  }

  private wrapToolsWithErrorContext(tools: ToolSet): ToolSet {
    const wrappedTools: ToolSet = {};

    for (const [toolName, tool] of Object.entries(tools)) {
      if (!tool.execute) {
        wrappedTools[toolName] = tool;
        continue;
      }

      const originalExecute = tool.execute;

      wrappedTools[toolName] = {
        ...tool,
        execute: async (...args: Parameters<typeof originalExecute>) => {
          try {
            return await originalExecute(...args);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);

            return {
              success: false,
              error: {
                message: errorMessage,
                tool: toolName,
                suggestion: this.generateErrorSuggestion(
                  toolName,
                  errorMessage,
                ),
              },
            };
          }
        },
      };
    }

    return wrappedTools;
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

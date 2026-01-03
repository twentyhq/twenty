import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolSet, zodSchema } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { type ZodType } from 'zod';

import {
  type CodeExecutionStreamEmitter,
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type ToolIndexEntry = {
  name: string;
  description: string;
  category:
    | 'database'
    | 'action'
    | 'workflow'
    | 'metadata'
    | 'view'
    | 'dashboard';
  objectName?: string;
  operation?: string;
  inputSchema?: object;
};

export type ToolSearchOptions = {
  limit?: number;
  category?:
    | 'database'
    | 'action'
    | 'workflow'
    | 'metadata'
    | 'view'
    | 'dashboard';
};

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
  ) {}

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
    const entries: ToolIndexEntry[] = [];

    for (const provider of this.providers) {
      if (await provider.isAvailable(context)) {
        const tools = await provider.generateTools(context);

        entries.push(...this.toolSetToIndex(tools, provider.category));
      }
    }

    this.logger.log(
      `Built tool index with ${entries.length} tools for workspace ${workspaceId}`,
    );

    return entries;
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
    const index = await this.buildToolIndex(workspaceId, roleId, {
      userId,
      userWorkspaceId,
    });

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
    const allTools: ToolSet = {};

    for (const provider of this.providers) {
      if (await provider.isAvailable(fullContext)) {
        const tools = await provider.generateTools(fullContext);

        Object.assign(allTools, tools);
      }
    }

    return Object.fromEntries(
      names
        .filter((name) => name in allTools)
        .map((name) => [name, allTools[name]]),
    );
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
    const categoryMap: Record<ToolCategory, ToolIndexEntry['category']> = {
      DATABASE_CRUD: 'database',
      ACTION: 'action',
      WORKFLOW: 'workflow',
      METADATA: 'metadata',
      NATIVE_MODEL: 'action',
      VIEW: 'view',
      DASHBOARD: 'dashboard',
      SERVERLESS_FUNCTION: 'action',
    };

    return Object.entries(tools).map(([name, tool]) => {
      const inputSchema = this.extractJsonSchema(tool.inputSchema);

      return {
        name,
        description: tool.description ?? '',
        category: categoryMap[category],
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
}

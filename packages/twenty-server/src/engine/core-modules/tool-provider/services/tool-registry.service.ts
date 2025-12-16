import { Inject, Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

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
  ): Promise<ToolIndexEntry[]> {
    const context = this.buildContext(workspaceId, roleId);
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
    options: ToolSearchOptions = {},
  ): Promise<ToolIndexEntry[]> {
    const { limit = 5, category } = options;
    const index = await this.buildToolIndex(workspaceId, roleId);

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
    };

    return Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.description ?? '',
      category: categoryMap[category],
    }));
  }
}

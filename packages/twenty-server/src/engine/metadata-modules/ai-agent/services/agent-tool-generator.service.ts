import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { Repository } from 'typeorm';

import type { ActorMetadata } from 'twenty-shared/types';

import { ToolAdapterService } from 'src/engine/metadata-modules/ai-tools/services/tool-adapter.service';
import { ToolService } from 'src/engine/metadata-modules/ai-tools/services/tool.service';
import { SearchArticlesTool } from 'src/engine/core-modules/tool/tools/search-articles-tool/search-articles-tool';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import type { ToolHints } from 'src/engine/metadata-modules/ai-router/types/tool-hints.interface';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';
import { WorkflowToolWorkspaceService as WorkflowToolService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class AgentToolGeneratorService {
  private readonly logger = new Logger(AgentToolGeneratorService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly toolService: ToolService,
    private readonly workflowToolService: WorkflowToolService,
    private readonly permissionsService: PermissionsService,
    private readonly searchArticlesTool: SearchArticlesTool,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    roleIds?: string[],
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    let tools: ToolSet = {};

    try {
      const agent = await this.agentRepository.findOne({
        where: { id: agentId },
      });

      if (agent?.standardId === HELPER_AGENT.standardId) {
        return this.wrapToolsWithErrorContext(this.getHelperAgentTools());
      }

      const actionTools = await this.toolAdapterService.getTools();

      tools = { ...actionTools };

      if (!roleIds) {
        return this.wrapToolsWithErrorContext(tools);
      }

      const hasWorkflowPermission =
        await this.permissionsService.checkRolesPermissions(
          { intersectionOf: roleIds },
          workspaceId,
          PermissionFlagType.WORKFLOWS,
        );

      if (hasWorkflowPermission) {
        const workflowTools = this.workflowToolService.generateWorkflowTools(
          workspaceId,
          { intersectionOf: roleIds },
        );

        tools = { ...tools, ...workflowTools };
      }

      const databaseTools = await this.toolService.listTools(
        { intersectionOf: roleIds },
        workspaceId,
        actorContext,
        toolHints,
      );

      tools = { ...tools, ...databaseTools };

      const roleActionTools = await this.toolAdapterService.getTools(
        { intersectionOf: roleIds },
        workspaceId,
      );

      tools = { ...tools, ...roleActionTools };
    } catch (toolError) {
      this.logger.warn(
        `Failed to generate tools for agent ${agentId}: ${toolError.message}. Proceeding without tools.`,
      );
    }

    return this.wrapToolsWithErrorContext(tools);
  }

  private getHelperAgentTools(): ToolSet {
    const tools: ToolSet = {
      search_articles: {
        description: this.searchArticlesTool.description,
        inputSchema: this.searchArticlesTool.inputSchema,
        execute: async (params) =>
          this.searchArticlesTool.execute(params.input),
      },
    };

    this.logger.log('Generated search_articles tool for Helper agent');

    return tools;
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
    toolName: string,
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

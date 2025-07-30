import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AgentHandoffExecutorService } from 'src/engine/metadata-modules/agent/agent-handoff-executor.service';
import { AgentHandoffService } from 'src/engine/metadata-modules/agent/agent-handoff.service';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { camelCase } from 'src/utils/camel-case';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentHandoffService: AgentHandoffService,
    private readonly agentHandoffExecutorService: AgentHandoffExecutorService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolService: ToolService,
    private readonly toolAdapterService: ToolAdapterService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    const agent = await this.agentService.findOneAgent(agentId, workspaceId);

    const handoffTools = await this.generateHandoffTools(agentId, workspaceId);

    if (!agent.roleId) {
      const actionTools = await this.toolAdapterService.getTools();

      return { ...actionTools, ...handoffTools };
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: agent.roleId,
        workspaceId,
      },
    });

    if (!role) {
      return {};
    }

    const actionTools = await this.toolAdapterService.getTools(
      role.id,
      workspaceId,
    );

    const databaseTools = await this.toolService.listTools(
      role.id,
      workspaceId,
    );

    return { ...databaseTools, ...actionTools, ...handoffTools };
  }

  private async generateHandoffTools(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    const handoffTargets = await this.agentHandoffService.getHandoffTargets({
      fromAgentId: agentId,
      workspaceId,
    });

    const handoffTools = handoffTargets.reduce<ToolSet>(
      (tools, targetAgent) => {
        const toolName = `transfer_to_${camelCase(targetAgent.name)}`;

        const handoffSchema = z.object({
          reason: z.string().describe('Reason for transferring to this agent'),
          context: z
            .string()
            .optional()
            .describe('Additional context to pass to the receiving agent'),
        });

        tools[toolName] = {
          description: `Transfer this request to ${targetAgent.name} when you need their specialized expertise. Use this when the user's request is outside your capabilities or when ${targetAgent.name} would be better suited to handle the request.`,
          parameters: handoffSchema,
          execute: async ({ reason, context }) => {
            const result =
              await this.agentHandoffExecutorService.executeHandoff({
                fromAgentId: agentId,
                toAgentId: targetAgent.id,
                workspaceId,
                reason,
                context,
              });

            return {
              success: result.success,
              message: result.message || `Transferred to ${targetAgent.name}`,
              newAgentId: result.newAgentId,
              newAgentName: result.newAgentName,
            };
          },
        };

        return tools;
      },
      {},
    );

    return handoffTools;
  }
}

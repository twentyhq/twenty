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
import { AGENT_HANDOFF_DESCRIPTION_TEMPLATE } from 'src/engine/metadata-modules/agent/constants/agent-handoff-description.const';
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
    const handoffs = await this.agentHandoffService.getAgentHandoffs({
      fromAgentId: agentId,
      workspaceId,
    });

    const handoffTools = handoffs.reduce<ToolSet>((tools, handoff) => {
      const toolName = `handoff_to_${camelCase(handoff.toAgent.name)}`;

      const handoffSchema = z.object({
        toolDescription: z
          .string()
          .describe(
            "A clear, human-readable status message describing the handoff being made. This will be shown to the user while the handoff is being processed, so phrase it as a present-tense status update (e.g., 'Transferring you to the sales agent for pricing information').",
          ),
        input: z.object({
          reason: z
            .string()
            .describe(
              'Brief explanation of why this handoff is needed (e.g., "User needs pricing information", "User requires technical support", "User wants to discuss billing")',
            ),
          context: z
            .string()
            .optional()
            .describe(
              'Any relevant context or information to pass to the receiving agent (e.g., user preferences, previous conversation details, specific requirements)',
            ),
        }),
      });

      tools[toolName] = {
        description:
          handoff.description ||
          handoff.toAgent.description ||
          AGENT_HANDOFF_DESCRIPTION_TEMPLATE.replace(
            '{agentName}',
            handoff.toAgent.name,
          ),
        parameters: handoffSchema,
        execute: async ({ input: { reason, context } }) => {
          const result = await this.agentHandoffExecutorService.executeHandoff({
            fromAgentId: agentId,
            toAgentId: handoff.toAgent.id,
            workspaceId,
            reason,
            context,
          });

          return result;
        },
      };

      return tools;
    }, {});

    return handoffTools;
  }
}

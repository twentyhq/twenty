import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import {
  AgentExecutionContext,
  AgentHandoffExecutorService,
  HandoffRequest,
} from 'src/engine/metadata-modules/agent/agent-handoff-executor.service';
import { AgentHandoffService } from 'src/engine/metadata-modules/agent/agent-handoff.service';
import { AGENT_HANDOFF_DESCRIPTION_TEMPLATE } from 'src/engine/metadata-modules/agent/constants/agent-handoff-description.const';
import { AGENT_HANDOFF_SCHEMA } from 'src/engine/metadata-modules/agent/constants/agent-handoff-schema.const';
import { camelCase } from 'src/utils/camel-case';

@Injectable()
export class AgentHandoffToolService {
  constructor(
    private readonly agentHandoffService: AgentHandoffService,
    private readonly agentHandoffExecutorService: AgentHandoffExecutorService,
  ) {}

  public async generateHandoffTools(
    agentId: string,
    workspaceId: string,
    executionContext: AgentExecutionContext,
  ): Promise<ToolSet> {
    const handoffs = await this.agentHandoffService.getAgentHandoffs({
      fromAgentId: agentId,
      workspaceId,
    });

    const handoffTools = handoffs.reduce<ToolSet>((tools, handoff) => {
      const toolName = `handoff_to_${camelCase(handoff.toAgent.name)}`;

      tools[toolName] = {
        description:
          handoff.description ||
          handoff.toAgent.description ||
          AGENT_HANDOFF_DESCRIPTION_TEMPLATE.replace(
            '{agentName}',
            handoff.toAgent.name,
          ),
        inputSchema: AGENT_HANDOFF_SCHEMA,
        execute: async ({ input }) => {
          const handoffRequest: HandoffRequest = {
            fromAgentId: agentId,
            toAgentId: handoff.toAgent.id,
            workspaceId,
            messages: input.messages,
            isStreaming: true, // Tools are executed during streaming
          };

          return this.agentHandoffExecutorService.executeHandoff(
            handoffRequest,
            executionContext,
          );
        },
      };

      return tools;
    }, {});

    return handoffTools;
  }
}

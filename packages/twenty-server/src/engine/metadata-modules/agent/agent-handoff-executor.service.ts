import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateText } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';

import { AgentHandoffService } from './agent-handoff.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export type HandoffRequest = {
  fromAgentId: string;
  toAgentId: string;
  workspaceId: string;
  reason: string;
  context?: string;
};

@Injectable()
export class AgentHandoffExecutorService {
  private readonly logger = new Logger(AgentHandoffExecutorService.name);

  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly agentHandoffService: AgentHandoffService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async executeHandoff(handoffRequest: HandoffRequest) {
    try {
      const { fromAgentId, toAgentId, workspaceId, reason } = handoffRequest;

      const canHandoff = await this.agentHandoffService.canHandoffTo({
        fromAgentId,
        toAgentId,
        workspaceId,
      });

      if (!canHandoff) {
        throw new AgentException(
          `Agent ${fromAgentId} is not allowed to hand off to agent ${toAgentId}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const targetAgent = await this.agentRepository.findOne({
        where: { id: toAgentId, workspaceId },
      });

      if (!targetAgent) {
        throw new AgentException(
          `Target agent ${toAgentId} not found`,
          AgentExceptionCode.AGENT_NOT_FOUND,
        );
      }

      const registeredModel = this.aiModelRegistryService.getModel(
        targetAgent.modelId,
      );

      if (!registeredModel) {
        throw new AgentException(
          `Model ${targetAgent.modelId} not found in registry`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const aiRequestConfig = {
        system: targetAgent.prompt,
        prompt: this.createHandoffPrompt(handoffRequest),
        model: registeredModel.model,
      };

      const textResponse = await generateText(aiRequestConfig);

      return {
        success: true,
        newAgentId: toAgentId,
        newAgentName: targetAgent.name,
        message: `Successfully transferred to ${targetAgent.name}. ${reason}`,
        response: textResponse.text,
      };
    } catch (error) {
      this.logger.error(
        `Handoff execution failed: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        newAgentId: handoffRequest.toAgentId,
        newAgentName: 'Unknown',
        error: error.message,
      };
    }
  }

  private createHandoffPrompt(handoffRequest: HandoffRequest): string {
    const { reason, context } = handoffRequest;

    const prompt = `
You have received a handoff from another AI agent. This means the previous agent has determined that you are better suited to handle this conversation based on your specialized knowledge and capabilities.

The previous agent has transferred this conversation to you because: ${reason}

Additional context from the previous agent:
${context || 'No additional context provided'}

Please continue the conversation naturally, acknowledging that you are taking over from the previous agent. Use your specialized knowledge to provide the best possible assistance to the user.
`;

    return prompt;
  }
}

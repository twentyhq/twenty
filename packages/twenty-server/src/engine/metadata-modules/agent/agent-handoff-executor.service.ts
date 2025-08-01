import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateText } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AGENT_HANDOFF_PROMPT_TEMPLATE } from 'src/engine/metadata-modules/agent/constants/agent-handoff-prompt.const';

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
      const { fromAgentId, toAgentId, workspaceId } = handoffRequest;

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

      return textResponse.text;
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

    return AGENT_HANDOFF_PROMPT_TEMPLATE.replace('{reason}', reason).replace(
      '{context}',
      context || 'No additional context provided',
    );
  }
}

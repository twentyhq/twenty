import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CoreMessage, generateText } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';

import { AgentHandoffService } from './agent-handoff.service';
import { AgentToolGeneratorService } from './agent-tool-generator.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export type HandoffRequest = {
  fromAgentId: string;
  toAgentId: string;
  workspaceId: string;
  messages?: CoreMessage[];
};

@Injectable()
export class AgentHandoffExecutorService {
  private readonly logger = new Logger(AgentHandoffExecutorService.name);

  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly agentHandoffService: AgentHandoffService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
  ) {}

  async executeHandoff(handoffRequest: HandoffRequest) {
    try {
      const { fromAgentId, toAgentId, workspaceId, messages } = handoffRequest;

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

      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(targetAgent);

      if (!registeredModel) {
        throw new AgentException(
          `Model ${targetAgent.modelId} not found in registry`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const tools = await this.agentToolGeneratorService.generateToolsForAgent(
        toAgentId,
        workspaceId,
      );

      const aiRequestConfig = {
        system: targetAgent.prompt,
        messages,
        tools,
        model: registeredModel.model,
      };

      const textResponse = await generateText(aiRequestConfig);

      this.logger.log(
        `Successfully executed handoff to agent ${toAgentId} with response length: ${textResponse.text.length}`,
      );

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
}

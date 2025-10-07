import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProviderOptions } from '@ai-sdk/provider-utils';
import {
  generateText,
  LanguageModel,
  ModelMessage,
  StopCondition,
  streamText,
  ToolSet,
  UIDataTypes,
  UIMessage,
  UITools,
} from 'ai';
import { Repository } from 'typeorm';

import { AgentHandoffService } from './agent-handoff.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export type HandoffRequest = {
  fromAgentId: string;
  toAgentId: string;
  workspaceId: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  isStreaming?: boolean;
};

export interface AgentExecutionContext {
  prepareAIRequestConfig: (params: {
    system: string;
    agent: AgentEntity | null;
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    excludeHandoffTools?: boolean; // Prevent infinite recursion
  }) => Promise<{
    system: string;
    tools: ToolSet;
    model: LanguageModel;
    messages: ModelMessage[];
    stopWhen?: StopCondition<ToolSet>;
    providerOptions?: ProviderOptions;
  }>;
}

@Injectable()
export class AgentHandoffExecutorService {
  private readonly logger = new Logger(AgentHandoffExecutorService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly agentHandoffService: AgentHandoffService,
  ) {}

  async executeHandoff(
    handoffRequest: HandoffRequest,
    executionContext: AgentExecutionContext,
  ) {
    try {
      const {
        fromAgentId,
        toAgentId,
        workspaceId,
        messages,
        isStreaming = false,
      } = handoffRequest;

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

      // Prepare AI request config using the execution context
      const aiRequestConfig = await executionContext.prepareAIRequestConfig({
        system: targetAgent.prompt,
        agent: targetAgent,
        messages,
        excludeHandoffTools: true, // Prevent infinite recursion
      });

      if (isStreaming) {
        // Return stream for streaming contexts
        const stream = streamText(aiRequestConfig);

        this.logger.log(`Started streaming handoff to agent ${toAgentId}`);

        return stream;
      } else {
        // Use generateText for non-streaming contexts (workflows)
        const textResponse = await generateText(aiRequestConfig);

        this.logger.log(
          `Successfully executed handoff to agent ${toAgentId} with response length: ${textResponse.text.length}`,
        );

        return {
          success: true,
          message: `Successfully executed handoff to agent ${targetAgent.name}`,
          result: {
            response: textResponse.text,
            targetAgentName: targetAgent.name,
          },
        };
      }
    } catch (error) {
      this.logger.error(
        `Handoff execution failed: ${error.message}`,
        error.stack,
      );

      const { isStreaming = false, toAgentId } = handoffRequest;

      if (isStreaming) {
        throw error; // Let streaming context handle the error
      }

      return {
        success: false,
        message: `Failed to execute handoff to agent ${toAgentId}`,
        error: error.message,
      };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateObject,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

export interface AiRouterContext {
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  workspaceId: string;
  routerModel: ModelId;
}

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async routeMessage(context: AiRouterContext) {
    try {
      const { messages, workspaceId, routerModel } = context;

      const availableAgents = await this.getAvailableAgents(workspaceId);

      if (availableAgents.length === 0) {
        this.logger.warn('No agents available for routing');

        return null;
      }

      if (availableAgents.length === 1) {
        return availableAgents[0];
      }

      const conversationHistory = messages
        .slice(0, -1)
        .map((msg) => {
          const textContent =
            msg.parts.find((part) => part.type === 'text')?.text || '';

          return `${msg.role}: ${textContent}`;
        })
        .join('\n');

      const currentMessage =
        messages[messages.length - 1]?.parts.find(
          (part) => part.type === 'text',
        )?.text || '';

      const model = this.getRouterModel(routerModel);
      const agentDescriptions = this.buildAgentDescriptions(availableAgents);

      const systemPrompt = this.buildRouterSystemPrompt(agentDescriptions);
      const userPrompt = this.buildRouterUserPrompt(
        conversationHistory,
        currentMessage,
      );

      const routerDecisionSchema = z.object({
        agentId: z
          .enum(availableAgents.map((agent) => agent.id))
          .describe('The ID of the most suitable agent to handle this message'),
      });

      const result = await generateObject({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        schema: routerDecisionSchema,
        temperature: 0.1,
      });

      return availableAgents.find(
        (agent) => agent.id === result.object.agentId,
      );
    } catch (error) {
      this.logger.error('Routing to agent failed:', error);

      const availableAgents = await this.getAvailableAgents(
        context.workspaceId,
      );

      return availableAgents[0] || null;
    }
  }

  private async getAvailableAgents(
    workspaceId: string,
  ): Promise<AgentEntity[]> {
    return this.agentRepository.find({
      where: { workspaceId, deletedAt: undefined },
      order: { createdAt: 'ASC' },
    });
  }

  private getRouterModel(modelId: ModelId) {
    if (modelId === 'auto') {
      const registeredModel =
        this.aiModelRegistryService.getDefaultSpeedModel();

      if (!registeredModel) {
        throw new Error('No router model available');
      }

      return registeredModel.model;
    }

    const registeredModel = this.aiModelRegistryService.getModel(modelId);

    if (!registeredModel) {
      throw new Error(`Router model "${modelId}" not available`);
    }

    return registeredModel.model;
  }

  private buildAgentDescriptions(agents: AgentEntity[]): string {
    return agents
      .map((agent) => `- ${agent.label} (${agent.id}): ${agent.description}`)
      .join('\n');
  }

  private buildRouterSystemPrompt(agentDescriptions: string): string {
    return `You are an AI router that decides which agent should handle a user's message.

Available agents:
${agentDescriptions}

Your task is to analyze the user's message and conversation history, then select the most appropriate agent to handle it. Choose the agent whose description and capabilities best match the user's request.`;
  }

  private buildRouterUserPrompt(
    conversationHistory: string,
    currentMessage: string,
  ): string {
    return `Conversation history:
${conversationHistory || 'No previous conversation'}

Current user message:
${currentMessage}

Which agent should handle this message?`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateObject,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { type Repository } from 'typeorm';
import { z } from 'zod';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/core-modules/ai/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-related-object.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { DATA_MANIPULATOR_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/data-manipulator-agent';
import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';

export interface AiRouterContext {
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  workspaceId: string;
  routerModel: ModelId;
}

export interface AiRouterResult {
  agent: AgentEntity | null;
  debugInfo?: {
    availableAgents: Array<{ id: string; label: string }>;
    routerModel: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async routeMessage(
    context: AiRouterContext,
    includeDebugInfo = false,
  ): Promise<AiRouterResult> {
    try {
      const { messages, workspaceId, routerModel } = context;

      const availableAgents = await this.getAvailableAgents(workspaceId);

      if (availableAgents.length === 0) {
        this.logger.warn('No agents available for routing');

        return { agent: null };
      }

      const debugInfo: AiRouterResult['debugInfo'] = includeDebugInfo
        ? {
            availableAgents: availableAgents.map((agent) => ({
              id: agent.id,
              label: agent.label,
            })),
            routerModel: String(routerModel),
          }
        : undefined;

      if (availableAgents.length === 1) {
        return { agent: availableAgents[0], debugInfo };
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
      const workspaceObjectsList =
        await this.buildWorkspaceObjectsList(workspaceId);
      const agentDescriptions = this.buildAgentDescriptions(
        availableAgents,
        workspaceObjectsList,
      );

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
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      const selectedAgent = availableAgents.find(
        (agent) => agent.id === result.object.agentId,
      );

      if (includeDebugInfo && debugInfo) {
        try {
          const usage = await result.usage;

          const usageWithTokens = usage as {
            inputTokens?: number;
            outputTokens?: number;
            promptTokens?: number;
            completionTokens?: number;
            totalTokens?: number;
          };

          debugInfo.promptTokens =
            usageWithTokens.inputTokens ?? usageWithTokens.promptTokens ?? 0;
          debugInfo.completionTokens =
            usageWithTokens.outputTokens ??
            usageWithTokens.completionTokens ??
            0;
          debugInfo.totalTokens = usageWithTokens.totalTokens ?? 0;
        } catch (error) {
          this.logger.warn('Failed to get routing token usage:', error);
        }
      }

      return { agent: selectedAgent ?? null, debugInfo };
    } catch (error) {
      this.logger.error(
        'Routing to agent failed, falling back to Helper agent:',
        error,
      );

      const helperAgent = await this.getHelperAgent(context.workspaceId);

      return { agent: helperAgent };
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

  private async getHelperAgent(workspaceId: string) {
    const helperAgent = await this.agentRepository.findOne({
      where: {
        workspaceId,
        standardId: HELPER_AGENT.standardId,
      },
    });

    return helperAgent;
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

  private async buildWorkspaceObjectsList(
    workspaceId: string,
  ): Promise<string> {
    try {
      const objects = await this.objectMetadataService.findManyWithinWorkspace(
        workspaceId,
        {
          where: { isActive: true, isSystem: false },
        },
      );

      const filteredObjects = objects.filter(
        (obj) => !isWorkflowRelatedObject(obj),
      );

      if (filteredObjects.length === 0) {
        return '';
      }

      return filteredObjects
        .map((obj) => `- ${obj.labelSingular} (${obj.nameSingular})`)
        .join('\n');
    } catch (error) {
      this.logger.warn('Failed to build workspace objects list:', error);

      return '';
    }
  }

  private buildAgentDescriptions(
    agents: AgentEntity[],
    workspaceObjectsList: string,
  ): string {
    return agents
      .map((agent) => {
        const baseDescription = `- ${agent.label} (${agent.id}): ${agent.description}`;

        if (
          agent.standardId === DATA_MANIPULATOR_AGENT.standardId &&
          workspaceObjectsList
        ) {
          return `${baseDescription}

Available workspace objects:
${workspaceObjectsList}`;
        }

        return baseDescription;
      })
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

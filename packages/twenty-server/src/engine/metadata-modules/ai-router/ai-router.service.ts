import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateObject,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { IsNull, type Repository } from 'typeorm';
import { z } from 'zod';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/core-modules/ai/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-related-object.util';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { DATA_MANIPULATOR_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/data-manipulator-agent';
import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';

import { type UnifiedRouterResult } from './types/router-result.interface';

export interface AiRouterContext {
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  workspaceId: string;
  routerModel: ModelId;
  plannerModel: ModelId;
}

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly objectMetadataService: ObjectMetadataServiceV2,
  ) {}

  async routeMessage(
    context: AiRouterContext,
    includeDebugInfo = false,
  ): Promise<UnifiedRouterResult> {
    try {
      const { messages, workspaceId, routerModel, plannerModel } = context;

      const availableAgents = await this.getAvailableAgents(workspaceId);

      if (availableAgents.length === 0) {
        this.logger.warn('No agents available for routing');

        const helperAgent = await this.getHelperAgent(workspaceId);

        if (!helperAgent) {
          throw new Error('No helper agent available');
        }

        return {
          strategy: 'simple',
          agent: helperAgent,
        };
      }

      const debugInfo = includeDebugInfo
        ? {
            availableAgents: availableAgents.map((agent) => ({
              id: agent.id,
              label: agent.label,
            })),
            routerModel: String(plannerModel ?? routerModel),
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          }
        : undefined;

      if (availableAgents.length === 1) {
        return {
          strategy: 'simple',
          agent: availableAgents[0],
          debugInfo,
        };
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

      const modelToUse = plannerModel ?? routerModel;
      const model = this.getRouterModel(modelToUse);
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

      const agentNames = availableAgents.map((agent) => agent.name);

      if (agentNames.length === 0) {
        throw new Error('No agent names available for routing schema');
      }

      const planStepSchema = z.object({
        stepNumber: z.number().describe('Step number in execution order'),
        agentName: z
          .enum([agentNames[0], ...agentNames.slice(1)])
          .describe('Agent name to execute this step'),
        task: z.string().describe('Specific task for this agent'),
        expectedOutput: z.string().describe('Expected output from this step'),
        dependsOn: z
          .array(z.number())
          .optional()
          .describe('Step numbers this step depends on'),
      });

      const unifiedRouterSchema = z.discriminatedUnion('strategy', [
        z.object({
          strategy: z.literal('simple'),
          agentName: z
            .enum([agentNames[0], ...agentNames.slice(1)])
            .describe('The name of the agent to handle this message'),
          toolHints: z
            .object({
              relevantObjects: z
                .array(z.string())
                .optional()
                .describe('Names of objects mentioned in the query'),
              operations: z
                .array(z.enum(['find', 'create', 'update', 'delete']))
                .optional()
                .describe('Required operations'),
            })
            .optional(),
        }),
        z.object({
          strategy: z.literal('planned'),
          plan: z.object({
            steps: z.array(planStepSchema).describe('Execution steps'),
            reasoning: z.string().describe('Why planning is needed'),
          }),
        }),
      ]);

      const ROUTER_TEMPERATURE = 0.1;

      const result = await generateObject({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        schema: unifiedRouterSchema,
        temperature: ROUTER_TEMPERATURE,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

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

      if (result.object.strategy === 'simple') {
        const simpleResult = result.object;
        const selectedAgent = availableAgents.find(
          (agent) => agent.name === simpleResult.agentName,
        );

        if (!selectedAgent) {
          throw new Error(`Selected agent ${simpleResult.agentName} not found`);
        }

        return {
          strategy: 'simple',
          agent: selectedAgent,
          toolHints: simpleResult.toolHints,
          debugInfo,
        };
      } else {
        return {
          strategy: 'planned',
          plan: result.object.plan,
          debugInfo,
        };
      }
    } catch (error) {
      this.logger.error(
        'Routing with planning failed, falling back to Helper agent:',
        error,
      );

      const helperAgent = await this.getHelperAgent(context.workspaceId);

      if (!helperAgent) {
        throw new Error('No helper agent available for fallback');
      }

      return {
        strategy: 'simple',
        agent: helperAgent,
      };
    }
  }

  private async getAvailableAgents(
    workspaceId: string,
  ): Promise<AgentEntity[]> {
    const agents = await this.agentRepository.find({
      where: { workspaceId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    return agents.filter(
      (agent) => !agent.name.includes('workflow-service-agent'),
    );
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
        const baseDescription = `- ${agent.label} (${agent.name}): ${agent.description}`;

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
    return AGENT_SYSTEM_PROMPTS.ROUTER(agentDescriptions);
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

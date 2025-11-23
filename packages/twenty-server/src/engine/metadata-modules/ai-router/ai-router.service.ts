import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type UIDataTypes, type UIMessage, type UITools } from 'ai';
import { IsNull, type Repository } from 'typeorm';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-related-object.util';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { HELPER_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/helper-agent';

import { AiRouterPlanGeneratorService } from './services/ai-router-plan-generator.service';
import { AiRouterStrategyDeciderService } from './services/ai-router-strategy-decider.service';
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
    private readonly strategyDecider: AiRouterStrategyDeciderService,
    private readonly planGenerator: AiRouterPlanGeneratorService,
    private readonly objectMetadataService: ObjectMetadataServiceV2,
  ) {}

  async routeMessage(
    context: AiRouterContext,
    includeDebugInfo = false,
  ): Promise<UnifiedRouterResult> {
    try {
      const { messages, workspaceId, routerModel, plannerModel } = context;

      const availableAgents = await this.getAvailableAgents(workspaceId);

      this.logger.log(
        `[ROUTER] Available agents (${availableAgents.length}): ${availableAgents.map((a) => `${a.label} (${a.name})`).join(', ')}`,
      );

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

      const workspaceObjectsList =
        await this.buildWorkspaceObjectsList(workspaceId);
      const agentDescriptions = this.buildAgentDescriptions(
        availableAgents,
        workspaceObjectsList,
      );

      this.logger.log(`[ROUTER] Agent descriptions:\n${agentDescriptions}`);

      const currentMessage =
        messages[messages.length - 1]?.parts.find(
          (part) => part.type === 'text',
        )?.text || '';

      this.logger.log(
        `[ROUTER] User message: "${currentMessage.substring(0, 100)}..."`,
      );

      const strategyDecision = await this.strategyDecider.decideStrategy({
        messages,
        availableAgents,
        agentDescriptions,
        routerModel,
      });

      if (strategyDecision.strategy === 'simple') {
        if (!strategyDecision.agentName) {
          throw new Error('agentName is required for simple strategy');
        }

        const selectedAgent = availableAgents.find(
          (agent) => agent.name === strategyDecision.agentName,
        );

        if (!selectedAgent) {
          this.logger.error(
            `[ROUTER] Agent "${strategyDecision.agentName}" not found in available agents: ${availableAgents.map((a) => a.name).join(', ')}`,
          );
          throw new Error(
            `Selected agent ${strategyDecision.agentName} not found`,
          );
        }

        this.logger.log(
          `[ROUTER] Routing to ${selectedAgent.label} (${selectedAgent.name})`,
        );

        return {
          strategy: 'simple',
          agent: selectedAgent,
          toolHints: strategyDecision.toolHints,
          debugInfo,
        };
      }

      const plan = await this.planGenerator.generatePlan({
        messages,
        availableAgents,
        agentDescriptions,
        plannerModel,
      });

      if (plan.steps.length === 1) {
        this.logger.log(
          `[ROUTER] Plan has only 1 step, converting to simple strategy`,
        );

        const singleStep = plan.steps[0];
        const selectedAgent = availableAgents.find(
          (agent) => agent.name === singleStep.agentName,
        );

        if (!selectedAgent) {
          this.logger.error(
            `[ROUTER] Agent "${singleStep.agentName}" not found in available agents`,
          );
          throw new Error(`Selected agent ${singleStep.agentName} not found`);
        }

        return {
          strategy: 'simple',
          agent: selectedAgent,
          debugInfo,
        };
      }

      this.logger.log(
        `[ROUTER] Executing planned strategy with ${plan.steps.length} steps`,
      );

      return {
        strategy: 'planned',
        plan,
        debugInfo,
      };
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
    const agentDescriptions = agents
      .map((agent) => {
        return `- ${agent.label} (${agent.name}): ${agent.description}`;
      })
      .join('\n');

    if (workspaceObjectsList) {
      return `${agentDescriptions}

Available workspace objects for data-manipulator:
${workspaceObjectsList}`;
    }

    return agentDescriptions;
  }
}

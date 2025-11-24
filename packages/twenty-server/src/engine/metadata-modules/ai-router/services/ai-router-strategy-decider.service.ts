import { Injectable, Logger } from '@nestjs/common';

import {
  generateObject,
  type LanguageModel,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { z } from 'zod';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/core-modules/ai/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { type AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';

export type StrategyDecision = {
  strategy: 'simple' | 'planned';
  agentName?: string;
  toolHints?: {
    relevantObjects?: string[];
    operations?: Array<'find' | 'create' | 'update' | 'delete'>;
  };
};

@Injectable()
export class AiRouterStrategyDeciderService {
  private readonly logger = new Logger(AiRouterStrategyDeciderService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async decideStrategy({
    messages,
    availableAgents,
    agentDescriptions,
    routerModel,
  }: {
    messages: UIMessage<unknown, UIDataTypes, UITools>[];
    availableAgents: AgentEntity[];
    agentDescriptions: string;
    routerModel: ModelId;
  }): Promise<StrategyDecision> {
    if (availableAgents.length === 1) {
      return this.createSingleAgentDecision(availableAgents[0]);
    }

    const model = this.getRouterModel(routerModel);
    const agentNames = availableAgents.map((agent) => agent.name);
    const conversationHistory = this.buildConversationHistory(messages);
    const currentMessage = this.extractCurrentMessage(messages);

    const systemPrompt = AGENT_SYSTEM_PROMPTS.ROUTER(agentDescriptions);
    const userPrompt = this.buildUserPrompt(
      conversationHistory,
      currentMessage,
    );

    const strategySchema = this.buildStrategySchema(agentNames);
    const decision = await this.generateStrategyDecision(
      model,
      systemPrompt,
      userPrompt,
      strategySchema,
    );

    this.logger.log(
      `[STRATEGY] Decision: ${JSON.stringify(decision, null, 2)}`,
    );

    return decision;
  }

  private createSingleAgentDecision(agent: AgentEntity): StrategyDecision {
    return {
      strategy: 'simple',
      agentName: agent.name,
    };
  }

  private buildConversationHistory(
    messages: UIMessage<unknown, UIDataTypes, UITools>[],
  ): string {
    return messages
      .slice(0, -1)
      .map((message) => {
        const textContent =
          message.parts.find((part) => part.type === 'text')?.text || '';

        return `${message.role}: ${textContent}`;
      })
      .join('\n');
  }

  private extractCurrentMessage(
    messages: UIMessage<unknown, UIDataTypes, UITools>[],
  ): string {
    return (
      messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
        ?.text || ''
    );
  }

  private buildStrategySchema(agentNames: string[]) {
    return z.object({
      strategy: z
        .enum(['simple', 'planned'])
        .describe(
          'Routing strategy: "simple" for single agent, "planned" for multi-agent coordination',
        ),
      agentName: z
        .enum([agentNames[0], ...agentNames.slice(1)])
        .optional()
        .describe(
          'Agent name (REQUIRED if strategy is "simple", omit if "planned")',
        ),
      toolHints: z
        .object({
          relevantObjects: z
            .array(z.string())
            .optional()
            .describe('Names of objects mentioned (e.g., "company", "person")'),
          operations: z
            .array(z.enum(['find', 'create', 'update', 'delete']))
            .optional()
            .describe('Required database operations'),
        })
        .optional()
        .describe('Tool hints for simple strategy (optional)'),
    });
  }

  private async generateStrategyDecision(
    model: LanguageModel,
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodTypeAny,
  ): Promise<StrategyDecision> {
    const ROUTER_TEMPERATURE = 0.1;

    const result = await generateObject({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      schema,
      temperature: ROUTER_TEMPERATURE,
      experimental_telemetry: AI_TELEMETRY_CONFIG,
    });

    return result.object as StrategyDecision;
  }

  private getRouterModel(modelId: ModelId) {
    if (modelId === 'auto') {
      return this.getDefaultRouterModel();
    }

    return this.getSpecificRouterModel(modelId);
  }

  private getDefaultRouterModel() {
    const registeredModel = this.aiModelRegistryService.getDefaultSpeedModel();

    if (!registeredModel) {
      throw new Error('No router model available');
    }

    return registeredModel.model;
  }

  private getSpecificRouterModel(modelId: ModelId) {
    const registeredModel = this.aiModelRegistryService.getModel(modelId);

    if (!registeredModel) {
      throw new Error(`Router model "${modelId}" not available`);
    }

    return registeredModel.model;
  }

  private buildUserPrompt(
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

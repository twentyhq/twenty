import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModelUsage } from 'ai';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import {
  type AIModelConfig,
  type ModelId,
  ModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-types.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export type BillingUsageInput = {
  usage: LanguageModelUsage;
  cacheCreationTokens?: number;
};

@Injectable()
export class AIBillingService {
  private readonly logger = new Logger(AIBillingService.name);

  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  calculateCost(modelId: ModelId, billingInput: BillingUsageInput): number {
    const model = this.aiModelRegistryService.getEffectiveModelConfig(modelId);

    if (!model) {
      throw new Error(`AI model with id ${modelId} not found`);
    }

    return this.computeCostFromUsage(model, billingInput);
  }

  calculateAndBillUsage(
    modelId: ModelId,
    billingInput: BillingUsageInput,
    workspaceId: string,
    agentId?: string | null,
  ): void {
    const costInDollars = this.calculateCost(modelId, billingInput);
    const creditsUsed = Math.round(
      convertDollarsToBillingCredits(costInDollars),
    );

    this.sendAiTokenUsageEvent(workspaceId, creditsUsed, modelId, agentId);
  }

  // OpenAI/xAI/Groq: inputTokens includes cached tokens (cached is a subset)
  // Anthropic: inputTokens excludes cached and cache creation tokens
  private computeCostFromUsage(
    model: AIModelConfig,
    billingInput: BillingUsageInput,
  ): number {
    const { usage, cacheCreationTokens = 0 } = billingInput;

    const safe = (value: number | undefined): number => {
      const result = value ?? 0;

      return Number.isFinite(result) ? result : 0;
    };

    const rawInputTokens = safe(usage.inputTokens);
    const outputTokens = safe(usage.outputTokens);
    const reasoningTokens = safe(usage.reasoningTokens);
    const cachedInputTokens = safe(usage.cachedInputTokens);
    const safeCacheCreationTokens = safe(cacheCreationTokens);

    const excludesCachedTokens = model.modelFamily === ModelFamily.ANTHROPIC;

    const adjustedInputTokens = excludesCachedTokens
      ? rawInputTokens
      : rawInputTokens - cachedInputTokens;

    const totalInputTokens = excludesCachedTokens
      ? adjustedInputTokens + cachedInputTokens + safeCacheCreationTokens
      : adjustedInputTokens + cachedInputTokens + safeCacheCreationTokens;

    const costInfo =
      model.longContextCost &&
      totalInputTokens > model.longContextCost.thresholdTokens
        ? model.longContextCost
        : model;

    const inputRate = costInfo.inputCostPerMillionTokens;
    const outputRate = costInfo.outputCostPerMillionTokens;
    const cachedRate = costInfo.cachedInputCostPerMillionTokens ?? inputRate;
    const cacheCreationRate =
      costInfo.cacheCreationCostPerMillionTokens ?? inputRate;

    const inputCost = (adjustedInputTokens / 1_000_000) * inputRate;
    const cachedInputCost = (cachedInputTokens / 1_000_000) * cachedRate;
    const cacheCreationCost =
      (safeCacheCreationTokens / 1_000_000) * cacheCreationRate;
    const outputCost = (outputTokens / 1_000_000) * outputRate;
    const reasoningCost = (reasoningTokens / 1_000_000) * outputRate;

    const totalCost =
      inputCost +
      cachedInputCost +
      cacheCreationCost +
      outputCost +
      reasoningCost;

    this.logger.log(
      `Cost for ${model.modelId}: $${totalCost.toFixed(6)} ` +
        `(input: ${adjustedInputTokens}, cached: ${cachedInputTokens}, ` +
        `cacheCreation: ${safeCacheCreationTokens}, output: ${outputTokens}, ` +
        `reasoning: ${reasoningTokens})`,
    );

    return totalCost;
  }

  private sendAiTokenUsageEvent(
    workspaceId: string,
    creditsUsed: number,
    modelId: ModelId,
    agentId?: string | null,
  ): void {
    this.workspaceEventEmitter.emitCustomBatchEvent<BillingUsageEvent>(
      BILLING_FEATURE_USED,
      [
        {
          eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
          value: creditsUsed,
          dimensions: {
            execution_type: 'ai_token',
            resource_id: agentId || null,
            execution_context_1: modelId,
          },
        },
      ],
      workspaceId,
    );
  }
}

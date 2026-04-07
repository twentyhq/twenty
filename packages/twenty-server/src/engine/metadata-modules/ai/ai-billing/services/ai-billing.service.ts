import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModelUsage } from 'ai';

import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export type BillingUsageInput = {
  usage: LanguageModelUsage;
  cacheCreationTokens?: number;
};

@Injectable()
export class AiBillingService {
  private readonly logger = new Logger(AiBillingService.name);

  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  calculateCost(modelId: ModelId, billingInput: BillingUsageInput): number {
    const model = this.aiModelRegistryService.getEffectiveModelConfig(modelId);
    const { usage, cacheCreationTokens = 0 } = billingInput;

    const breakdown = computeCostBreakdown(model, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      reasoningTokens: usage.outputTokenDetails?.reasoningTokens,
      cachedInputTokens: usage.inputTokenDetails?.cacheReadTokens,
      cacheCreationTokens,
    });

    this.logger.log(
      `Cost for ${model.modelId}: $${breakdown.totalCostInDollars.toFixed(6)} ` +
        `(input: ${breakdown.tokenCounts.adjustedInputTokens}, ` +
        `cached: ${breakdown.tokenCounts.cachedInputTokens}, ` +
        `cacheCreation: ${breakdown.tokenCounts.cacheCreationTokens}, ` +
        `output: ${breakdown.tokenCounts.adjustedOutputTokens}, ` +
        `reasoning: ${breakdown.tokenCounts.reasoningTokens})`,
    );

    return breakdown.totalCostInDollars;
  }

  calculateAndBillUsage(
    modelId: ModelId,
    billingInput: BillingUsageInput,
    workspaceId: string,
    operationType: UsageOperationType,
    agentId?: string | null,
    userWorkspaceId?: string | null,
  ): void {
    const costInDollars = this.calculateCost(modelId, billingInput);
    const creditsUsedMicro = Math.round(
      convertDollarsToBillingCredits(costInDollars),
    );

    const totalTokens =
      (billingInput.usage.inputTokens ?? 0) +
      (billingInput.usage.outputTokens ?? 0) +
      (billingInput.cacheCreationTokens ?? 0);

    this.emitAiTokenUsageEvent(
      workspaceId,
      creditsUsedMicro,
      totalTokens,
      modelId,
      operationType,
      agentId,
      userWorkspaceId,
    );
  }

  billNativeWebSearchUsage(
    nativeWebSearchCallCount: number,
    workspaceId: string,
    userWorkspaceId?: string | null,
  ): void {
    if (nativeWebSearchCallCount <= 0) {
      return;
    }

    const costInDollars =
      nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;
    const creditsUsedMicro = Math.round(
      convertDollarsToBillingCredits(costInDollars),
    );

    this.logger.log(
      `Native web search billing: ${nativeWebSearchCallCount} calls, $${costInDollars.toFixed(4)}`,
    );

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.WEB_SEARCH,
          creditsUsedMicro,
          quantity: nativeWebSearchCallCount,
          unit: UsageUnit.INVOCATION,
          userWorkspaceId: userWorkspaceId || null,
        },
      ],
      workspaceId,
    );
  }

  private emitAiTokenUsageEvent(
    workspaceId: string,
    creditsUsedMicro: number,
    totalTokens: number,
    modelId: ModelId,
    operationType: UsageOperationType,
    agentId?: string | null,
    userWorkspaceId?: string | null,
  ): void {
    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.AI,
          operationType,
          creditsUsedMicro,
          quantity: totalTokens,
          unit: UsageUnit.TOKEN,
          resourceId: agentId || null,
          resourceContext: modelId,
          userWorkspaceId: userWorkspaceId || null,
        },
      ],
      workspaceId,
    );
  }
}

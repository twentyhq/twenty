import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModelUsage } from 'ai';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

export type BillingUsageInput = {
  usage: LanguageModelUsage;
  cacheCreationTokens?: number;
};

@Injectable()
export class AiBillingService {
  private readonly logger = new Logger(AiBillingService.name);

  constructor(
    private readonly usageRecorderService: UsageRecorderService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async assertAiExecutionAllowed({
    workspaceId,
    operationType,
    spenders,
  }: {
    workspaceId: string;
    operationType: UsageOperationType;
    spenders: UsageSpenders;
  }): Promise<void> {
    await this.billingUsageService.assertUsageAllowed({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType,
      spenders,
    });
  }

  private async consumeQuota({
    workspaceId,
    operationType,
    spenders,
    cost,
  }: {
    workspaceId: string;
    operationType: UsageOperationType;
    spenders: UsageSpenders;
    cost: QuotaCost;
  }): Promise<{ hasNoMoreAvailableCredits: boolean }> {
    return this.billingUsageService.consumeUsageQuota({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType,
      spenders,
      cost,
    });
  }

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

  async calculateAndBillUsage(
    modelId: ModelId,
    billingInput: BillingUsageInput,
    workspaceId: string,
    operationType: UsageOperationType,
    agentId?: string | null,
    userWorkspaceId?: string | null,
  ): Promise<void> {
    const costInDollars = this.calculateCost(modelId, billingInput);
    const creditsUsedMicro = Math.round(
      convertDollarsToBillingCredits(costInDollars),
    );

    const totalTokens =
      (billingInput.usage.inputTokens ?? 0) +
      (billingInput.usage.outputTokens ?? 0);

    await this.consumeQuota({
      workspaceId,
      operationType,
      spenders: { userWorkspaceId, agentId },
      cost: { creditsUsedMicro, quantity: totalTokens },
    });

    await this.emitAiTokenUsageEvent(
      workspaceId,
      creditsUsedMicro,
      totalTokens,
      modelId,
      operationType,
      agentId,
      userWorkspaceId,
    );
  }

  async decrementAndCheckAvailableCredits({
    modelId,
    billingInput,
    workspaceId,
    operationType,
    spenders,
  }: {
    modelId: ModelId;
    billingInput: BillingUsageInput;
    workspaceId: string;
    operationType: UsageOperationType;
    spenders: UsageSpenders;
  }): Promise<{ hasNoMoreAvailableCredits: boolean }> {
    const costInDollars = this.calculateCost(modelId, billingInput);

    const totalTokens =
      (billingInput.usage.inputTokens ?? 0) +
      (billingInput.usage.outputTokens ?? 0);

    return this.consumeQuota({
      workspaceId,
      operationType,
      spenders,
      cost: {
        creditsUsedMicro: Math.round(
          convertDollarsToBillingCredits(costInDollars),
        ),
        quantity: totalTokens,
      },
    });
  }

  async billNativeWebSearchUsage(
    nativeWebSearchCallCount: number,
    workspaceId: string,
    userWorkspaceId?: string | null,
  ): Promise<void> {
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

    await this.consumeQuota({
      workspaceId,
      operationType: UsageOperationType.WEB_SEARCH,
      spenders: { userWorkspaceId },
      cost: { creditsUsedMicro, quantity: nativeWebSearchCallCount },
    });

    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.WEB_SEARCH,
        creditsUsedMicro,
        quantity: nativeWebSearchCallCount,
        unit: UsageUnit.INVOCATION,
        spenders: { userWorkspaceId },
      },
    ]);
  }

  async emitAiTokenUsageEvent(
    workspaceId: string,
    creditsUsedMicro: number,
    totalTokens: number,
    modelId: ModelId,
    operationType: UsageOperationType,
    agentId?: string | null,
    userWorkspaceId?: string | null,
  ): Promise<void> {
    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.AI,
        operationType,
        creditsUsedMicro,
        quantity: totalTokens,
        unit: UsageUnit.TOKEN,
        resourceId: agentId || null,
        resourceContext: modelId,
        spenders: { userWorkspaceId, agentId },
      },
    ]);
  }
}

import { Injectable, Logger } from '@nestjs/common';

import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageQuotaAdmissionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-admission.service';
import { type QuotaDebitResult } from 'src/engine/core-modules/usage-limit/types/quota-debit-result.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { type BillableStep } from 'src/engine/metadata-modules/ai/ai-billing/types/billable-step.type';
import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import { computeStepCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-step-cost-breakdown.util';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

export type WebSearchOperationType =
  | UsageOperationType.WEB_SEARCH
  | UsageOperationType.AI_WORKFLOW_WEB_SEARCH;

export type BillingUsageInput = {
  usage: BillingTokenUsage;
  cacheCreationTokens?: number;
};

@Injectable()
export class AiBillingService {
  private readonly logger = new Logger(AiBillingService.name);

  constructor(
    private readonly usageRecorderService: UsageRecorderService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly usageQuotaAdmissionService: UsageQuotaAdmissionService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
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
    await this.usageQuotaAdmissionService.assertUsageAllowed({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType,
      spenders,
    });
  }

  // evaluation models first: getEffectiveModelConfig throws on ids outside its registry
  private getCostConfig(modelId: ModelId): AiModelCostConfig {
    return (
      this.aiModelRegistryService.getEvaluationModelConfig(modelId) ??
      this.aiModelRegistryService.getEffectiveModelConfig(modelId)
    );
  }

  calculateStepsCost(modelId: ModelId, steps: BillableStep[]): number {
    const model = this.getCostConfig(modelId);

    return steps.reduce(
      (costInDollars, step) =>
        costInDollars +
        computeStepCostBreakdown(model, {
          usage: step.usage,
          cacheCreationTokens: extractCacheCreationTokens(
            step.providerMetadata,
          ),
        }).totalCostInDollars,
      0,
    );
  }

  calculateCost(modelId: ModelId, billingInput: BillingUsageInput): number {
    const model = this.getCostConfig(modelId);
    const breakdown = computeStepCostBreakdown(model, billingInput);

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

  async calculateAndBillUsage({
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
  }): Promise<void> {
    const costInDollars = this.calculateCost(modelId, billingInput);
    const creditsUsedMicro = convertDollarsToCreditsMicro(costInDollars);

    const totalTokens =
      (billingInput.usage.inputTokens ?? 0) +
      (billingInput.usage.outputTokens ?? 0);

    await this.usageLimitQuotaService.charge({
      workspaceId,
      events: [
        this.buildAiTokenUsageEvent({
          creditsUsedMicro,
          totalTokens,
          modelId,
          operationType,
          spenders,
        }),
      ],
    });
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
  }): Promise<StepDebitResult> {
    const costInDollars = this.calculateCost(modelId, billingInput);
    const creditsUsedMicro = convertDollarsToCreditsMicro(costInDollars);

    const totalTokens =
      (billingInput.usage.inputTokens ?? 0) +
      (billingInput.usage.outputTokens ?? 0);

    return this.toStepDebitResult(
      await this.usageLimitQuotaService.debitAheadOfRecord({
        workspaceId,
        event: this.buildAiTokenUsageEvent({
          creditsUsedMicro,
          totalTokens,
          modelId,
          operationType,
          spenders,
        }),
      }),
    );
  }

  private async billNativeWebSearchUsage({
    nativeWebSearchCallCount,
    workspaceId,
    operationType,
    spenders,
  }: {
    nativeWebSearchCallCount: number;
    workspaceId: string;
    operationType: WebSearchOperationType;
    spenders: UsageSpenders;
  }): Promise<StepDebitResult | null> {
    if (nativeWebSearchCallCount <= 0) {
      return null;
    }

    const costInDollars =
      nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;
    const creditsUsedMicro = convertDollarsToCreditsMicro(costInDollars);

    this.logger.log(
      `Native web search billing: ${nativeWebSearchCallCount} calls, $${costInDollars.toFixed(4)}`,
    );

    const event: RecordUsageInput = {
      resourceType: UsageResourceType.AI,
      operationType,
      creditsUsedMicro,
      quantity: nativeWebSearchCallCount,
      unit: UsageUnit.INVOCATION,
      spenders,
    };

    const webSearchDebit = await this.usageLimitQuotaService.debitAheadOfRecord(
      {
        workspaceId,
        event,
      },
    );

    await this.usageRecorderService.record(workspaceId, [
      { ...event, userCreditsUsedMicro: webSearchDebit.userCreditsUsedMicro },
    ]);

    return this.toStepDebitResult(webSearchDebit);
  }

  // returns the web search debit, so a caller can tell when it crossed the user's allowance
  async recordStepsUsage({
    modelId,
    steps,
    workspaceId,
    operationType,
    webSearchOperationType,
    spenders,
    userCreditsUsedMicro,
  }: {
    modelId: ModelId;
    steps: (BillableStep & { toolCalls: { toolName: string }[] })[];
    workspaceId: string;
    operationType: UsageOperationType;
    webSearchOperationType: WebSearchOperationType;
    spenders: UsageSpenders;
    userCreditsUsedMicro: number;
  }): Promise<StepDebitResult | null> {
    const totalTokens = steps.reduce(
      (total, { usage }) =>
        total + (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      0,
    );
    const creditsUsedMicro = convertDollarsToCreditsMicro(
      this.calculateStepsCost(modelId, steps),
    );

    // a failed token record must not also skip charging for searches already made
    const [, webSearchDebit] = await Promise.all([
      this.usageRecorderService.record(workspaceId, [
        {
          ...this.buildAiTokenUsageEvent({
            creditsUsedMicro,
            totalTokens,
            modelId,
            operationType,
            spenders,
          }),
          userCreditsUsedMicro: Math.min(
            userCreditsUsedMicro,
            creditsUsedMicro,
          ),
        },
      ]),
      this.billNativeWebSearchUsage({
        nativeWebSearchCallCount: countNativeWebSearchCallsFromSteps(steps),
        workspaceId,
        operationType: webSearchOperationType,
        spenders,
      }),
    ]);

    return webSearchDebit;
  }

  private toStepDebitResult({
    exhaustedKind,
    ...userAllowanceDebit
  }: QuotaDebitResult): StepDebitResult {
    return {
      stopReason: exhaustedKind === 'limit' ? null : exhaustedKind,
      ...userAllowanceDebit,
    };
  }

  private buildAiTokenUsageEvent({
    creditsUsedMicro,
    totalTokens,
    modelId,
    operationType,
    spenders,
  }: {
    creditsUsedMicro: number;
    totalTokens: number;
    modelId: ModelId;
    operationType: UsageOperationType;
    spenders: UsageSpenders;
  }): RecordUsageInput {
    return {
      resourceType: UsageResourceType.AI,
      operationType,
      creditsUsedMicro,
      quantity: totalTokens,
      unit: UsageUnit.TOKEN,
      resourceId: spenders.agentId || null,
      resourceContext: modelId,
      spenders,
    };
  }
}

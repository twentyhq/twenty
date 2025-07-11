import { Injectable, Logger } from '@nestjs/common';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/core-modules/ai/constants/dollar-to-credit-multiplier';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

@Injectable()
export class AIBillingService {
  private readonly logger = new Logger(AIBillingService.name);

  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async calculateCost(modelId: ModelId, usage: TokenUsage): Promise<number> {
    const model = this.aiModelRegistryService.getEffectiveModelConfig(modelId);

    if (!model) {
      throw new Error(`AI model with id ${modelId} not found`);
    }

    const inputCost =
      (usage.promptTokens / 1000) * model.inputCostPer1kTokensInCents;
    const outputCost =
      (usage.completionTokens / 1000) * model.outputCostPer1kTokensInCents;

    const totalCost = inputCost + outputCost;

    this.logger.log(
      `Calculated cost for model ${modelId}: ${totalCost} cents (input: ${inputCost}, output: ${outputCost})`,
    );

    return totalCost;
  }

  async calculateAndBillUsage(
    modelId: ModelId,
    usage: TokenUsage,
    workspaceId: string,
  ): Promise<void> {
    const costInCents = await this.calculateCost(modelId, usage);

    const costInDollars = costInCents / 100;
    const creditsUsed = Math.round(costInDollars * DOLLAR_TO_CREDIT_MULTIPLIER);

    this.sendAiTokenUsageEvent(workspaceId, creditsUsed);
  }

  private sendAiTokenUsageEvent(
    workspaceId: string,
    creditsUsed: number,
  ): void {
    this.workspaceEventEmitter.emitCustomBatchEvent<BillingUsageEvent>(
      BILLING_FEATURE_USED,
      [
        {
          eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
          value: creditsUsed,
        },
      ],
      workspaceId,
    );
  }
}

import { Injectable, Logger } from '@nestjs/common';

import { LanguageModelUsage } from 'ai';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { convertCentsToBillingCredits } from 'src/engine/core-modules/ai/utils/convert-cents-to-billing-credits.util';
import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class AIBillingService {
  private readonly logger = new Logger(AIBillingService.name);

  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async calculateCost(
    modelId: ModelId,
    usage: LanguageModelUsage,
  ): Promise<number> {
    const model = this.aiModelRegistryService.getEffectiveModelConfig(modelId);

    if (!model) {
      throw new Error(`AI model with id ${modelId} not found`);
    }

    const inputCost =
      ((usage.inputTokens ?? 0) / 1000) * model.inputCostPer1kTokensInCents;
    const outputCost =
      ((usage.outputTokens ?? 0) / 1000) * model.outputCostPer1kTokensInCents;

    const totalCost = inputCost + outputCost;

    this.logger.log(
      `Calculated cost for model ${modelId}: ${totalCost} cents (input: ${inputCost}, output: ${outputCost})`,
    );

    return totalCost;
  }

  async calculateAndBillUsage(
    modelId: ModelId,
    usage: LanguageModelUsage,
    workspaceId: string,
  ): Promise<void> {
    const costInCents = await this.calculateCost(modelId, usage);
    const creditsUsed = Math.round(convertCentsToBillingCredits(costInCents));

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

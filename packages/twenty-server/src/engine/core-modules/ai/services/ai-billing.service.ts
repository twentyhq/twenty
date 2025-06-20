import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AIModel } from 'src/engine/core-modules/ai/entities/ai-model.entity';
import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// Configuration: $0.001 = 1 credit
const DOLLAR_TO_CREDIT_MULTIPLIER = 1000; // 1 / 0.001 = 1000 credits per dollar

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostCalculation {
  costInCents: number;
  model: AIModel;
}

@Injectable()
export class AIBillingService {
  constructor(
    @InjectRepository(AIModel, 'core')
    private readonly aiModelRepository: Repository<AIModel>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async calculateCost(
    modelId: string,
    tokenUsage: TokenUsage,
  ): Promise<number | null> {
    const model = await this.aiModelRepository.findOne({
      where: { modelId, isActive: true },
    });

    if (!model) {
      return null;
    }

    const inputCost =
      (tokenUsage.promptTokens / 1000) * model.inputCostPer1kTokensInCents;
    const outputCost =
      (tokenUsage.completionTokens / 1000) * model.outputCostPer1kTokensInCents;

    const totalCostInCents = inputCost + outputCost;

    return totalCostInCents;
  }

  async calculateAndBillUsage(
    modelId: string,
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
    workspaceId: string,
  ): Promise<void> {
    const costInCents = await this.calculateCost(modelId, tokenUsage);

    if (costInCents !== null) {
      const costInDollars = costInCents / 100;
      const creditsUsed = Math.round(
        costInDollars * DOLLAR_TO_CREDIT_MULTIPLIER,
      );

      this.sendAiTokenUsageEvent(workspaceId, creditsUsed);
    }
  }

  private sendAiTokenUsageEvent(workspaceId: string, creditsUsed: number) {
    this.workspaceEventEmitter.emitCustomBatchEvent<BillingUsageEvent>(
      BILLING_FEATURE_USED,
      [
        {
          eventName: BillingMeterEventName.AI_TOKEN_USAGE,
          value: creditsUsed,
        },
      ],
      workspaceId,
    );
  }
}

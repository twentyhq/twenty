/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

@Injectable()
export class BillingFeatureUsedListener {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @OnCustomBatchEvent(BILLING_FEATURE_USED)
  async handleBillingFeatureUsedEvent(
    payload: WorkspaceEventBatch<BillingUsageEvent>,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const canFeatureBeUsed = await this.billingUsageService.canFeatureBeUsed(
      payload.workspaceId,
    );

    if (!canFeatureBeUsed) {
      return;
    }

    await this.billingUsageService.billUsage({
      workspaceId: payload.workspaceId,
      billingEvents: payload.events,
    });
  }
}

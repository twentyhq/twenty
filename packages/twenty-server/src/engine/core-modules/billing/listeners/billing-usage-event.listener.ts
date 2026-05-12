/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from 'twenty-shared/types';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class BillingUsageEventListener {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @OnCustomBatchEvent(USAGE_RECORDED)
  async handleUsageRecordedEvent(
    payload: CustomWorkspaceEventBatch<UsageEvent>,
  ) {
    if (!isDefined(payload.workspaceId)) {
      return;
    }

    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const canFeatureBeUsed = await this.billingUsageService.canFeatureBeUsed(
      payload.workspaceId,
    );

    if (!canFeatureBeUsed) {
      return;
    }

    const isV2 = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_BILLING_V2_ENABLED,
      payload.workspaceId,
    );

    if (isV2) {
      // V2: ClickHouse is the sole record; no Stripe meter events needed
      return;
    }

    //TODO: To be removed
    await this.billingUsageService.billUsage({
      workspaceId: payload.workspaceId,
      usageEvents: payload.events,
    });
  }
}

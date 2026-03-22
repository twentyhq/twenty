/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { USAGE_RECORDED } from 'src/engine/core-modules/billing/constants/usage-recorded.constant';
import { UsageEventWriterService } from 'src/engine/core-modules/billing/services/usage-event-writer.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type UsageEvent } from 'src/engine/core-modules/billing/types/usage-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class UsageEventListener {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly usageEventWriterService: UsageEventWriterService,
    private readonly twentyConfigService: TwentyConfigService,
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

    await this.usageEventWriterService.writeAndBill({
      workspaceId: payload.workspaceId,
      usageEvents: payload.events,
    });
  }
}

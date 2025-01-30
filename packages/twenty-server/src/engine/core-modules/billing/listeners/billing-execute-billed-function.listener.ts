import { Injectable } from '@nestjs/common';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { BILLING_EXECUTE_BILLED_FUNCTION } from 'src/engine/core-modules/billing/constants/billing-execute-billed-function.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

@Injectable()
export class BillingExecuteBilledFunctionListener {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @OnCustomBatchEvent(BILLING_EXECUTE_BILLED_FUNCTION)
  async handleExecuteBilledFunctionEvent(
    payload: WorkspaceEventBatch<BillingUsageEvent>,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const canExecuteBilledFunction =
      await this.billingUsageService.canExecuteBilledFunction(
        payload.workspaceId,
      );

    if (!canExecuteBilledFunction) {
      return;
    }

    await this.billingUsageService.billUsage({
      workspaceId: payload.workspaceId,
      billingEvents: payload.events,
    });
  }
}

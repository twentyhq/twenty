/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { getEventLogRetentionInHours } from 'twenty-shared/utils';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

@Injectable()
export class EventLogRetentionService {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async getRetentionStartDate({
    workspaceId,
    workspaceRetentionInDays,
  }: {
    workspaceId: string;
    workspaceRetentionInDays: number;
  }): Promise<Date> {
    const retentionInHours = getEventLogRetentionInHours({
      workspaceRetentionInDays,
      hasAuditLogsEntitlement: await this.hasAuditLogsEntitlement(workspaceId),
    });

    return new Date(Date.now() - retentionInHours * 60 * 60 * 1000);
  }

  async validateRetentionUpdateOrThrow(workspaceId: string): Promise<void> {
    if (!(await this.hasAuditLogsEntitlement(workspaceId))) {
      throw new WorkspaceException(
        'Changing the event log retention requires the audit logs entitlement',
        WorkspaceExceptionCode.EVENT_LOG_RETENTION_DISABLED,
      );
    }
  }

  private async hasAuditLogsEntitlement(workspaceId: string) {
    return this.billingSubscriptionService.getWorkspaceEntitlementValue(
      workspaceId,
      BillingEntitlementKey.AUDIT_LOGS,
    );
  }
}

/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { EventLogTable } from 'twenty-shared/types';
import { getEventLogRetentionInDays } from 'twenty-shared/utils';

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

  async getRetentionInDaysByTable({
    workspaceId,
    workspaceRetentionInDays,
  }: {
    workspaceId: string;
    workspaceRetentionInDays: number;
  }): Promise<Record<EventLogTable, number>> {
    const hasAuditLogsEntitlement =
      await this.hasAuditLogsEntitlement(workspaceId);

    return Object.fromEntries(
      Object.values(EventLogTable).map((table) => [
        table,
        getEventLogRetentionInDays({
          table,
          workspaceRetentionInDays,
          hasAuditLogsEntitlement,
        }),
      ]),
    ) as Record<EventLogTable, number>;
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

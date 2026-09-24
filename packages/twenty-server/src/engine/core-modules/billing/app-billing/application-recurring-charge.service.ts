/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { buildRecurringChargeUsageEvents } from 'src/engine/core-modules/billing/app-billing/utils/build-recurring-charge-usage-events.util';
import {
  collectDeclaredRecurringCharges,
  type RejectedRecurringCharge,
} from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { collectDueRecurringCharges } from 'src/engine/core-modules/billing/app-billing/utils/collect-due-recurring-charges.util';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// Flat fees and per-seat fees an app declares in its manifest, raised by the
// platform once per billing period as ordinary credit usage. Recording through
// the same usage path as app-initiated charges is what makes them show up in
// Usage by App and on the credit meter without any separate plumbing.
@Injectable()
export class ApplicationRecurringChargeService {
  private readonly logger = new Logger(ApplicationRecurringChargeService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly usageRecorderService: UsageRecorderService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async chargeDueRecurringCharges(workspaceId: string): Promise<number> {
    if (!this.billingService.isBillingEnabled()) {
      return 0;
    }

    const { currentBillingSubscription, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
        'flatApplicationMaps',
      ]);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return 0;
    }

    const periodStart = currentBillingSubscription.currentPeriodStart;

    const { declaredCharges, rejectedCharges: malformedCharges } =
      collectDeclaredRecurringCharges({ flatApplicationMaps });

    this.reportRejectedCharges(workspaceId, malformedCharges);

    // Reading what the period already carries costs a ClickHouse query per
    // workspace per day, so it waits until an app actually declares something.
    if (declaredCharges.length === 0) {
      return 0;
    }

    // A MONTH charge on a yearly subscription would be raised once a year, not
    // twelve times, so it is skipped rather than silently under-charged. Only
    // reached once an app actually declares one, so the workspaces this is said
    // about are the ones running an app that expects to be paid and is not.
    // Reported at the level and cadence of a successful raise rather than as a
    // warning: the condition is by design and unchanging, so a daily warning
    // would only teach people to ignore it.
    if (currentBillingSubscription.interval !== SubscriptionInterval.Month) {
      this.logger.log(
        `Skipped ${declaredCharges.length} recurring app charge(s) for workspace ${workspaceId}: the workspace is on a ${currentBillingSubscription.interval} subscription and only MONTH charges can be raised`,
      );

      return 0;
    }

    const alreadyChargedKeys =
      await this.usageAnalyticsService.getChargedRecurringKeys({
        workspaceId,
        periodStart,
      });

    const dueCharges = collectDueRecurringCharges({
      declaredCharges,
      alreadyChargedKeys,
    });

    if (dueCharges.length === 0) {
      return 0;
    }

    const workspaceMemberCount = dueCharges.some(
      ({ charge }) => charge.per === 'WORKSPACE_MEMBER',
    )
      ? await this.countWorkspaceMembers(workspaceId)
      : 0;

    const { events, rejectedCharges: overCapCharges } =
      buildRecurringChargeUsageEvents({
        dueCharges,
        workspaceMemberCount,
        periodStart,
      });

    this.reportRejectedCharges(workspaceId, overCapCharges);

    if (events.length === 0) {
      return 0;
    }

    await this.usageRecorderService.record(workspaceId, events);

    this.logger.log(
      `Raised ${events.length} recurring app charge(s) for workspace ${workspaceId}`,
    );

    return events.length;
  }

  // A refused charge means an installed app is not being billed for the period,
  // which is invisible to everyone unless it is said out loud.
  private reportRejectedCharges(
    workspaceId: string,
    rejectedCharges: RejectedRecurringCharge[],
  ): void {
    for (const { applicationId, chargeKey, reason } of rejectedCharges) {
      this.logger.error(
        `Refused recurring charge "${chargeKey}" from application ${applicationId} in workspace ${workspaceId}: ${reason}`,
      );
    }
  }

  private async countWorkspaceMembers(workspaceId: string): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.count();
      },
      authContext,
      { lite: true },
    );
  }
}

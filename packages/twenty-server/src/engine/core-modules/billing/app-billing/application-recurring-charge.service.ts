/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import {
  type ApplicationBilling,
  type RecurringCharge,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type DueCharge = {
  applicationId: string;
  chargeKey: string;
  charge: RecurringCharge;
};

// Flat fees and per-seat fees an app declares in its manifest, raised by the
// platform once per billing period as ordinary credit usage. Charging through
// the same USAGE_RECORDED path as app-initiated charges is what makes them show
// up in Usage by App and on the credit meter without any separate plumbing.
@Injectable()
export class ApplicationRecurringChargeService {
  private readonly logger = new Logger(ApplicationRecurringChargeService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    // A MONTH charge on a yearly subscription would be raised once a year, not
    // twelve times, so it is skipped rather than silently under-charged.
    if (currentBillingSubscription.interval !== SubscriptionInterval.Month) {
      return 0;
    }

    const periodStart = currentBillingSubscription.currentPeriodStart;
    const declaredCharges = this.collectDeclaredCharges(flatApplicationMaps);

    if (declaredCharges.length === 0) {
      return 0;
    }

    const alreadyCharged =
      await this.usageAnalyticsService.getChargedRecurringKeys({
        workspaceId,
        periodStart,
      });

    const dueCharges = declaredCharges.filter(
      ({ applicationId, chargeKey }) =>
        !alreadyCharged.has(`${applicationId}:${chargeKey}`),
    );

    if (dueCharges.length === 0) {
      return 0;
    }

    const workspaceMemberCount = dueCharges.some(
      ({ charge }) => charge.per === 'WORKSPACE_MEMBER',
    )
      ? await this.countWorkspaceMembers(workspaceId)
      : 0;

    const events = dueCharges.flatMap(
      ({ applicationId, chargeKey, charge }) => {
        const quantity =
          charge.per === 'WORKSPACE_MEMBER' ? workspaceMemberCount : 1;

        if (quantity <= 0) {
          return [];
        }

        return [
          {
            resourceType: UsageResourceType.APP,
            operationType: UsageOperationType.SUBSCRIPTION,
            creditsUsedMicro: charge.amountMicroCredits * quantity,
            quantity,
            unit:
              charge.per === 'WORKSPACE_MEMBER'
                ? UsageUnit.SEAT
                : UsageUnit.CREDIT,
            resourceId: applicationId,
            resourceContext: chargeKey,
            userWorkspaceId: null,
            periodStart,
          } satisfies UsageEvent,
        ];
      },
    );

    if (events.length === 0) {
      return 0;
    }

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      events,
      workspaceId,
    );

    this.logger.log(
      `Raised ${events.length} recurring app charge(s) for workspace ${workspaceId}`,
    );

    return events.length;
  }

  private collectDeclaredCharges(flatApplicationMaps: {
    byId: Partial<Record<string, FlatApplication>>;
  }): DueCharge[] {
    return Object.values(flatApplicationMaps.byId).flatMap((application) => {
      if (!isDefined(application) || isDefined(application.deletedAt)) {
        return [];
      }

      // Undefined until the upgrade that adds the column has run.
      const billing: ApplicationBilling = application.billing ?? {};

      return Object.entries(billing.recurring ?? {}).flatMap(
        ([chargeKey, charge]) =>
          isDefined(charge)
            ? [{ applicationId: application.id, chargeKey, charge }]
            : [],
      );
    });
  }

  private async countWorkspaceMembers(workspaceId: string): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
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

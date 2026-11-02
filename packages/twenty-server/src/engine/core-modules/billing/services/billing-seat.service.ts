/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type SeatSyncPlan } from 'src/engine/core-modules/billing/types/seat-sync-plan.type';
import { buildBillingSeatLockKey } from 'src/engine/core-modules/billing/utils/build-billing-seat-lock-key.util';
import { computeSeatSyncPlan } from 'src/engine/core-modules/billing/utils/compute-seat-sync-plan.util';
import { isSeatLimitReached } from 'src/engine/core-modules/billing/utils/is-seat-limit-reached.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class BillingSeatService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingPriceService: BillingPriceService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async countWorkspaceMembers(workspaceId: string): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return await workspaceMemberRepository.count();
      },
      authContext,
      { lite: true },
    );
  }

  async findSeatArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: In(SEAT_BILLING_ARRANGEMENT_TYPES) },
    });
  }

  async computeCurrentSeatSyncPlan(workspaceId: string): Promise<{
    billingSubscriptionId: string;
    seatSyncPlan: SeatSyncPlan;
  } | null> {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const stripeSubscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        billingSubscription.stripeSubscriptionId,
      );

    const seatSyncPlan = await this.computeSeatSyncPlan({
      workspaceId,
      stripeSubscription,
      currentSeats: (
        await this.billingPriceService.getSubscriptionPricesFromItems(
          stripeSubscription.items.data,
        )
      ).seats,
    });

    return isDefined(seatSyncPlan)
      ? { billingSubscriptionId: billingSubscription.id, seatSyncPlan }
      : null;
  }

  async computeSeatSyncPlan({
    workspaceId,
    stripeSubscription,
    currentSeats,
  }: {
    workspaceId: string;
    stripeSubscription: Stripe.Subscription;
    currentSeats: number;
  }): Promise<SeatSyncPlan | null> {
    const memberCount = await this.countWorkspaceMembers(workspaceId);

    if (memberCount <= 0) {
      return null;
    }

    const { current_period_start, current_period_end } =
      stripeSubscription.items.data[0];

    return computeSeatSyncPlan({
      memberCount,
      currentSeats,
      seatArrangements: await this.findSeatArrangements(workspaceId),
      now: new Date(),
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000),
      isTrialing: stripeSubscription.status === SubscriptionStatus.Trialing,
    });
  }

  async addMemberWithinSeatLimit<TResult>(
    workspaceId: string,
    addMember: () => Promise<TResult>,
  ): Promise<TResult> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return await addMember();
    }

    const seatArrangements = await this.findSeatArrangements(workspaceId);

    if (seatArrangements.length === 0) {
      return await addMember();
    }

    return await this.cacheLockService.withLock(
      async () => {
        if (
          isSeatLimitReached({
            memberCount: await this.countWorkspaceMembers(workspaceId),
            seatArrangements,
            now: new Date(),
          })
        ) {
          throw new BillingException(
            `Workspace ${workspaceId} has reached its committed seats`,
            BillingExceptionCode.BILLING_SEAT_LIMIT_REACHED,
          );
        }

        return await addMember();
      },
      buildBillingSeatLockKey(workspaceId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }
}

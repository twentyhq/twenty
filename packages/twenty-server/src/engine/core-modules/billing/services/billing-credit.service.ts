/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { addDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const PROVISIONAL_GRANT_VALIDITY_IN_DAYS = 31;

export type GrantCreditsParams = {
  workspaceId: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  reason?: string | null;
  grantedByUserId?: string | null;
  idempotencyKey?: string | null;
  effectiveAt?: Date;
  expiresAt?: Date;
  sourceGrantId?: string | null;
};

@Injectable()
export class BillingCreditService {
  private readonly logger = new Logger(BillingCreditService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingUsageCacheService: BillingUsageCacheService,
    private readonly billingUsageCapService: BillingUsageCapService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  async grantCredits(
    params: GrantCreditsParams,
  ): Promise<BillingCreditGrantEntity | null> {
    if (!this.billingService.isBillingEnabled()) {
      return null;
    }

    const { workspaceId } = params;

    return this.cacheLockService.withLock(
      () => this.writeGrantAndRefreshState(params),
      buildBillingCreditStateLockKey(workspaceId),
    );
  }

  private async writeGrantAndRefreshState(
    params: GrantCreditsParams,
  ): Promise<BillingCreditGrantEntity | null> {
    const { workspaceId, amountMicro } = params;

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    const { effectiveAt, expiresAt } = resolveGrantValidity(
      params,
      subscription,
    );

    await this.billingCreditGrantService.materializeLegacyBalance({
      workspaceId,
      effectiveAt,
      expiresAt,
    });

    const grant = await this.billingCreditGrantService.createGrant({
      ...params,
      effectiveAt,
      expiresAt,
    });

    if (!isDefined(grant)) {
      this.logger.log(
        `Replayed credit grant for workspace ${workspaceId} (idempotency key ${params.idempotencyKey}), repairing derived state`,
      );

      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        addsCredits: true,
        isReplay: true,
        subscription,
      });

      return null;
    }

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: amountMicro,
      addsCredits: true,
      subscription,
    });

    return grant;
  }

  async revokeGrant({
    workspaceId,
    grantId,
    revokedByUserId,
  }: {
    workspaceId: string;
    grantId: string;
    revokedByUserId?: string | null;
  }): Promise<BillingCreditGrantEntity> {
    return this.cacheLockService.withLock(
      () =>
        this.markGrantRevokedAndRefreshState({
          workspaceId,
          grantId,
          revokedByUserId,
        }),
      buildBillingCreditStateLockKey(workspaceId),
    );
  }

  private async markGrantRevokedAndRefreshState({
    workspaceId,
    grantId,
    revokedByUserId,
  }: {
    workspaceId: string;
    grantId: string;
    revokedByUserId?: string | null;
  }): Promise<BillingCreditGrantEntity> {
    const { grant, wasRevokedNow } =
      await this.billingCreditGrantService.revokeGrant({
        workspaceId,
        grantId,
        revokedByUserId,
      });

    const adjustmentKey = buildRevocationAdjustmentKey(grantId);

    if (!wasRevokedNow) {
      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        addsCredits: false,
        isReplay: true,
        adjustmentKey,
      });

      return grant;
    }

    const revokedAtMs = (grant.revokedAt ?? new Date()).getTime();
    const wasActiveWhenRevoked =
      grant.effectiveAt.getTime() <= revokedAtMs &&
      grant.expiresAt.getTime() > revokedAtMs;

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: wasActiveWhenRevoked ? -grant.amountMicro : 0,
      addsCredits: false,
      adjustmentKey,
    });

    return grant;
  }

  async reconcileMirroredBalance(workspaceId: string): Promise<void> {
    if (!this.billingService.isBillingEnabled()) {
      return;
    }

    await this.cacheLockService.withLock(
      () => this.syncMirrorBalance(workspaceId),
      buildBillingCreditStateLockKey(workspaceId),
    );
  }

  private async syncMirrorBalance(workspaceId: string): Promise<number> {
    const activeCreditsMicro =
      await this.billingCreditGrantService.getActiveCreditsMicro(workspaceId);

    if (
      activeCreditsMicro === 0 &&
      !(await this.billingCreditGrantService.hasAnyGrant(workspaceId))
    ) {
      return 0;
    }

    await this.billingCustomerRepository.update(
      workspaceId,
      {},
      { creditBalanceMicro: activeCreditsMicro },
    );

    return activeCreditsMicro;
  }

  async refreshWorkspaceCreditState({
    workspaceId,
    availableDeltaMicro,
    addsCredits,
    isReplay = false,
    adjustmentKey,
    subscription: knownSubscription,
  }: {
    workspaceId: string;
    availableDeltaMicro: number;
    addsCredits: boolean;
    isReplay?: boolean;
    adjustmentKey?: string;
    subscription?: BillingSubscriptionEntity;
  }): Promise<void> {
    const activeCreditsMicro = await this.syncMirrorBalance(workspaceId);

    const subscription =
      knownSubscription ??
      (await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      }));

    if (!isDefined(subscription)) {
      return;
    }

    const periodStart = subscription.currentPeriodStart;

    const rebuildCounter =
      isReplay &&
      (!isDefined(adjustmentKey) ||
        !(await this.billingUsageCacheService.hasCounterAdjustmentBeenApplied(
          workspaceId,
          adjustmentKey,
        )));

    const counterAfterWriteMicro = await this.applyCounterWrite({
      workspaceId,
      periodStart,
      availableDeltaMicro,
      shouldRebuild: rebuildCounter,
    });

    if (isDefined(adjustmentKey)) {
      await this.billingUsageCacheService.markCounterAdjustmentApplied(
        workspaceId,
        adjustmentKey,
        subscription.currentPeriodEnd,
      );
    }

    const spendableAfterWriteMicro =
      counterAfterWriteMicro ?? activeCreditsMicro;

    return this.clearCapAndSubscriptionCache(workspaceId, {
      shouldClearCap:
        addsCredits &&
        spendableAfterWriteMicro > 0 &&
        (rebuildCounter || availableDeltaMicro > 0),
    });
  }

  private async applyCounterWrite({
    workspaceId,
    periodStart,
    availableDeltaMicro,
    shouldRebuild,
  }: {
    workspaceId: string;
    periodStart: Date;
    availableDeltaMicro: number;
    shouldRebuild: boolean;
  }): Promise<number | null> {
    if (shouldRebuild) {
      await this.billingUsageCacheService.invalidateAvailableCredits(
        workspaceId,
        periodStart,
      );

      return null;
    }

    if (availableDeltaMicro === 0) {
      return null;
    }

    const cachedAvailableCredits =
      await this.billingUsageCacheService.getAvailableCredits(
        workspaceId,
        periodStart,
      );

    if (!isDefined(cachedAvailableCredits)) {
      return null;
    }

    await this.billingUsageCacheService.adjustAvailableCredits(
      workspaceId,
      periodStart,
      availableDeltaMicro,
    );

    return cachedAvailableCredits + availableDeltaMicro;
  }

  private async clearCapAndSubscriptionCache(
    workspaceId: string,
    { shouldClearCap }: { shouldClearCap: boolean },
  ): Promise<void> {
    if (shouldClearCap) {
      await this.billingUsageCapService.clearHasReachedCapForWorkspace(
        workspaceId,
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'currentBillingSubscription',
    ]);
  }
}

const buildRevocationAdjustmentKey = (grantId: string): string =>
  `revoke:${grantId}`;

const resolveGrantValidity = (
  params: GrantCreditsParams,
  subscription: BillingSubscriptionEntity | undefined,
): { effectiveAt: Date; expiresAt: Date } => {
  const effectiveAt = params.effectiveAt ?? new Date();

  if (isDefined(params.expiresAt)) {
    return { effectiveAt, expiresAt: params.expiresAt };
  }

  const currentPeriodEnd = isDefined(subscription)
    ? getBillingSubscriptionPeriod(subscription).periodEnd
    : null;
  const hasUsablePeriodEnd =
    isDefined(currentPeriodEnd) &&
    currentPeriodEnd.getTime() > effectiveAt.getTime();

  return {
    effectiveAt,
    expiresAt: hasUsablePeriodEnd
      ? currentPeriodEnd
      : addDays(effectiveAt, PROVISIONAL_GRANT_VALIDITY_IN_DAYS),
  };
};

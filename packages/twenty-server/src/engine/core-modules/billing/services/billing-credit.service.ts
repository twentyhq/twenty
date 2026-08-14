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
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Used when a workspace has no subscription yet, which happens for rewards
// granted during signup. The next period transition re-emits the unspent part
// aligned on the real billing period.
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

    // Writing the row and moving the counter are two steps, and a reader that
    // computes availability between them counts the grant from the ledger and
    // then has it added a second time. Locking keeps the pair indivisible for
    // anything else touching this workspace's credit state.
    return this.cacheLockService.withLock(
      () => this.writeGrantAndRefreshState(params),
      buildBillingCreditStateLockKey(workspaceId),
    );
  }

  private async writeGrantAndRefreshState(
    params: GrantCreditsParams,
  ): Promise<BillingCreditGrantEntity | null> {
    const { workspaceId, amountMicro } = params;

    // Read once for the whole write: the validity window and the state refresh
    // both need it, and both run inside the lock. Reading it here rather than
    // before the lock is what keeps a grant that waited behind a period
    // transition from carrying the period the wait started in, which would
    // land it already expired while its amount still went onto the counter for
    // the period that had meanwhile opened.
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

    // A replay only means the ledger row exists, not that the projections
    // built from it do: the first attempt can have inserted the row and then
    // failed on the refresh, and onboarding callers swallow that error. Repair
    // rather than return, with no counter delta since the original attempt may
    // already have applied it.
    if (!isDefined(grant)) {
      this.logger.log(
        `Replayed credit grant for workspace ${workspaceId} (idempotency key ${params.idempotencyKey}), repairing derived state`,
      );

      // Rebuilding from the ledger can overstate the balance by whatever
      // usage ClickHouse has not ingested yet, and that value then stands for
      // the period. Accepted here because the alternative is a grant that
      // stays invisible for the whole period, and erring high is the direction
      // the grant intended.
      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        isReplay: true,
        subscription,
      });

      return null;
    }

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: amountMicro,
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

    // A retried revocation must not take the same credits off the usage
    // counter twice, which would block a workspace that still has credits.
    // Whether the attempt that did revoke got as far as the counter is
    // recorded under adjustmentKey, so the refresh can tell the two apart:
    // already applied means repair the rest and leave the counter alone, never
    // applied means rebuild from the ledger. Guessing either way is wrong,
    // since always rebuilding freezes ClickHouse lag in as extra credit on
    // every double click and never rebuilding leaves revoked credits spendable
    // until the period ends.
    if (!wasRevokedNow) {
      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        isReplay: true,
        adjustmentKey,
      });

      return grant;
    }

    // Only credits the counter actually holds may come off it. The mutation
    // accepts any grant id, and a grant can expire between the admin panel
    // rendering and the revoke landing, so subtracting unconditionally would
    // take away credits that were never counted and block usage until the
    // period ends.
    const revokedAtMs = (grant.revokedAt ?? new Date()).getTime();
    const wasActiveWhenRevoked =
      grant.effectiveAt.getTime() <= revokedAtMs &&
      grant.expiresAt.getTime() > revokedAtMs;

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: wasActiveWhenRevoked ? -grant.amountMicro : 0,
      adjustmentKey,
    });

    return grant;
  }

  // The mirror column only exists once a workspace has a billingCustomer row,
  // so a grant written before that (an onboarding reward at signup) mirrors
  // onto nothing. Called when the row appears, so rolling this release back
  // does not lose those credits. Remove along with creditBalanceMicro.
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

    // Until the backfill reaches a workspace the column is still the only copy
    // of its balance, and an empty ledger sums to zero. Callers materialize the
    // legacy balance before writing, but the guard belongs here too rather than
    // resting on an ordering contract between services.
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

  // Keeps everything that reads a credit balance consistent with the ledger:
  // the mirror column, the Redis counter that gates usage, and the cached
  // subscription the front reads. Public so a caller writing several grants at
  // once pays for this once; such a caller must hold
  // buildBillingCreditStateLockKey for its own ledger writes and this refresh
  // together, which is why this does not take the lock itself.
  async refreshWorkspaceCreditState({
    workspaceId,
    availableDeltaMicro,
    isReplay = false,
    adjustmentKey,
    subscription: knownSubscription,
  }: {
    workspaceId: string;
    availableDeltaMicro: number;
    // A replay cannot know how far the original attempt got, so the counter is
    // recomputed from the ledger unless adjustmentKey says it already moved.
    isReplay?: boolean;
    // Names a one-off adjustment so a retry can see it already landed.
    adjustmentKey?: string;
    // Saves a re-read for a caller that already has it in hand.
    subscription?: BillingSubscriptionEntity;
  }): Promise<void> {
    await this.syncMirrorBalance(workspaceId);

    const subscription =
      knownSubscription ??
      (await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      }));

    if (!isDefined(subscription)) {
      return;
    }

    // Deliberately not getBillingSubscriptionPeriod, which reports the trial
    // window while trialing: every usage path keys this counter off
    // currentPeriodStart, so taking the period from anywhere else would move a
    // key the gate never reads.
    const periodStart = subscription.currentPeriodStart;

    const rebuildCounter =
      isReplay &&
      (!isDefined(adjustmentKey) ||
        !(await this.billingUsageCacheService.hasCounterAdjustmentBeenApplied(
          workspaceId,
          adjustmentKey,
        )));

    await this.applyCounterWrite({
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

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'currentBillingSubscription',
    ]);
  }

  // Returns what the counter holds afterwards, or null when there is no warm
  // counter to speak for the workspace.
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

    // Adjusting the warm counter instead of flushing it avoids recomputing
    // from ClickHouse while its async inserts for recent usage are still
    // landing, which would credit the workspace for usage it already spent.
    const cachedAvailableCredits =
      await this.billingUsageCacheService.getAvailableCredits(
        workspaceId,
        periodStart,
      );

    // Nothing to do when the counter is cold. A reader can only warm it while
    // holding this same lock, so it cannot be mid-computation now, and the
    // next one to take the lock reads a ledger that already has this write.
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
}

// Scopes the completion marker to one revocation, so retrying it is the only
// thing that can see it.
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

  // A lapsed subscription still carries the period that just ended, and that is
  // exactly the workspace someone is most likely to be granting credits to.
  // Falling back keeps the grant from expiring on creation.
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

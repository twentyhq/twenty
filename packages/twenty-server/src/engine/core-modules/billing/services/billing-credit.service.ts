/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { addDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
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
    private readonly billingUsageCapService: BillingUsageCapService,
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

    const { workspaceId, amountMicro } = params;

    // Only needed to default the validity window; callers that supply their own
    // (the period transition) would otherwise pay for a three-table join.
    const subscription = isDefined(params.expiresAt)
      ? undefined
      : await this.billingSubscriptionService.getCurrentBillingSubscription({
          workspaceId,
        });

    const effectiveAt = params.effectiveAt ?? new Date();

    // A lapsed subscription still carries the period that just ended, and
    // that is exactly the workspace someone is most likely to be granting
    // credits to. Falling back keeps the grant from expiring on creation.
    const currentPeriodEnd = isDefined(subscription)
      ? getBillingSubscriptionPeriod(subscription).periodEnd
      : null;
    const hasUsablePeriodEnd =
      isDefined(currentPeriodEnd) &&
      currentPeriodEnd.getTime() > effectiveAt.getTime();

    const expiresAt =
      params.expiresAt ??
      (hasUsablePeriodEnd
        ? currentPeriodEnd
        : addDays(effectiveAt, PROVISIONAL_GRANT_VALIDITY_IN_DAYS));

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
      // the grant intended. The cap is left to be derived from the rebuilt
      // balance, since the replayed grant may since have been revoked.
      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        rebuildCounter: true,
      });

      return null;
    }

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: amountMicro,
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
    const { grant, wasRevokedNow } =
      await this.billingCreditGrantService.revokeGrant({
        workspaceId,
        grantId,
        revokedByUserId,
      });

    // A retried revocation must not take the same credits off the usage
    // counter twice, which would block a workspace that still has credits. It
    // still repairs the mirror, the cap flag and the cached subscription,
    // since the attempt that did revoke can have failed before refreshing.
    //
    // The counter is deliberately left alone rather than rebuilt: a rebuild
    // reads usage from ClickHouse, and any usage still in flight there would
    // be frozen into the counter as extra credit for the rest of the period.
    // That fires on every retry, including a double-clicked revoke, while the
    // stale counter it would repair only happens when an attempt failed
    // midway. Erring high is also the wrong direction for a revocation.
    if (!wasRevokedNow) {
      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
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
    });

    return grant;
  }

  // Returns what the ledger says is spendable, so callers rebuilding derived
  // state can decide from the balance rather than assuming one.
  private async syncMirrorBalance(workspaceId: string): Promise<number> {
    const activeCreditsMicro =
      await this.billingCreditGrantService.getActiveCreditsMicro(workspaceId);

    await this.billingCustomerRepository.update(
      workspaceId,
      {},
      { creditBalanceMicro: activeCreditsMicro },
    );

    return activeCreditsMicro;
  }

  // Keeps everything that reads a credit balance consistent with the ledger:
  // the mirror column, the Redis counter that gates usage, the flag that drives
  // the "no more credits" banner, and the cached subscription the front reads.
  // Public so a caller writing several grants at once pays for this once.
  async refreshWorkspaceCreditState({
    workspaceId,
    availableDeltaMicro,
    rebuildCounter = false,
    shouldClearCap = availableDeltaMicro > 0,
  }: {
    workspaceId: string;
    availableDeltaMicro: number;
    // Recomputes the counter from the ledger rather than moving it by a delta,
    // for repairs where how far the original attempt got is unknowable.
    rebuildCounter?: boolean;
    shouldClearCap?: boolean;
  }): Promise<void> {
    const activeCreditsMicro = await this.syncMirrorBalance(workspaceId);

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    // Deliberately not getBillingSubscriptionPeriod, which reports the trial
    // window while trialing: every usage path keys this counter off
    // currentPeriodStart, so taking the period from anywhere else would move a
    // key the gate never reads.
    const periodStart = subscription.currentPeriodStart;

    if (rebuildCounter) {
      await this.billingUsageCacheService.invalidateAvailableCredits(
        workspaceId,
        periodStart,
      );

      // A replayed grant may since have been revoked or expired, so the cap
      // follows what the ledger actually holds rather than the caller's
      // assumption.
      return this.clearCapAndSubscriptionCache(workspaceId, {
        shouldClearCap: activeCreditsMicro > 0,
      });
    }

    // Adjusting the warm counter instead of flushing it avoids recomputing
    // from ClickHouse while its async inserts for recent usage are still
    // landing, which would credit the workspace for usage it already spent.
    if (availableDeltaMicro !== 0) {
      const cachedAvailableCredits =
        await this.billingUsageCacheService.getAvailableCredits(
          workspaceId,
          periodStart,
        );

      if (isDefined(cachedAvailableCredits)) {
        await this.billingUsageCacheService.adjustAvailableCredits(
          workspaceId,
          periodStart,
          availableDeltaMicro,
        );
      } else {
        // Nothing to adjust, and a reader that missed the counter before this
        // write landed is still free to warm it from a balance that predates
        // the grant. That value would then stand until the period ends, so
        // mark the counter unwarmable for a short while and let readers
        // compute straight from the ledger until the marker lapses.
        await this.billingUsageCacheService.markAvailableCreditsStale(
          workspaceId,
          periodStart,
        );
      }
    }

    return this.clearCapAndSubscriptionCache(workspaceId, { shouldClearCap });
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

/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { alignGrantExpiryToPeriodEnd } from 'src/engine/core-modules/billing/utils/align-grant-expiry-to-period-end.util';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type GrantCreditsParams = {
  workspaceId: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  reason?: string | null;
  grantedByUserId?: string | null;
  idempotencyKey?: string | null;
  effectiveAt?: Date;
  // Only set for a deliberately time-boxed grant. Left out, the credits stay
  // spendable until a period transition settles them. Taken as the operator's
  // intent rather than a date so that the alignment onto a period end happens
  // here, where the invariant belongs, whoever the caller is.
  expiresInDays?: number | null;
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
    private readonly billingUsageService: BillingUsageService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
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

    const effectiveAt = params.effectiveAt ?? new Date();

    // A replay answers with what the first attempt wrote, so the operator's
    // intent is never re-derived: the subscription that anchored the original
    // expiry may have been canceled since, and the insert would discard the
    // answer anyway.
    const knownGrant = await this.findGrantByIdempotencyKey(params);

    const grant = isDefined(knownGrant)
      ? null
      : await this.billingCreditGrantService.createGrant({
          ...params,
          effectiveAt,
          expiresAt: resolveGrantExpiry({
            effectiveAt,
            expiresInDays: params.expiresInDays,
            subscription,
            workspaceId,
          }),
        });

    // Answers with the row that already exists rather than null, so a caller
    // recovering from a lost response does not have to look it up again. Read
    // again when the check above came back empty: the insert still reported a
    // duplicate, so another attempt won the key between the two, and only the
    // second read can see it.
    if (!isDefined(grant)) {
      const alreadyWrittenGrant =
        knownGrant ?? (await this.findGrantByIdempotencyKey(params));

      this.logger.log(
        `Replayed credit grant for workspace ${workspaceId} (idempotency key ${params.idempotencyKey}), repairing derived state`,
      );

      await this.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        isReplay: true,
        subscription,
      });

      return alreadyWrittenGrant;
    }

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: amountMicro,
      subscription,
    });

    return grant;
  }

  private async findGrantByIdempotencyKey({
    workspaceId,
    idempotencyKey,
  }: GrantCreditsParams): Promise<BillingCreditGrantEntity | null> {
    if (!isDefined(idempotencyKey)) {
      return null;
    }

    return this.billingCreditGrantService.findGrantByIdempotencyKey(
      workspaceId,
      idempotencyKey,
    );
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
        isReplay: true,
        adjustmentKey,
      });

      return grant;
    }

    const revokedAtMs = (grant.revokedAt ?? new Date()).getTime();
    const wasActiveWhenRevoked =
      grant.effectiveAt.getTime() <= revokedAtMs &&
      (!isDefined(grant.expiresAt) || grant.expiresAt.getTime() > revokedAtMs);

    await this.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: wasActiveWhenRevoked ? -grant.amountMicro : 0,
      adjustmentKey,
    });

    return grant;
  }

  async refreshWorkspaceCreditState({
    workspaceId,
    availableDeltaMicro,
    isReplay = false,
    adjustmentKey,
    subscription: knownSubscription,
  }: {
    workspaceId: string;
    availableDeltaMicro: number;
    isReplay?: boolean;
    adjustmentKey?: string;
    subscription?: BillingSubscriptionEntity;
  }): Promise<void> {
    const subscription =
      knownSubscription ??
      (await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      }));

    if (!isDefined(subscription)) {
      return;
    }

    // Not getBillingSubscriptionPeriod: while trialing it reports the trial window, and the counter is keyed off currentPeriodStart.
    const periodStart = subscription.currentPeriodStart;

    if (await this.billingUsageService.isAllowanceCounterEnabled(workspaceId)) {
      await this.billingUsageCacheService.invalidateAvailableCredits(
        workspaceId,
        periodStart,
      );
    } else {
      await this.adjustAvailableCreditsCounter({
        workspaceId,
        periodStart,
        periodEnd: subscription.currentPeriodEnd,
        availableDeltaMicro,
        isReplay,
        adjustmentKey,
        // Incrementing a warm counter leaves its lifetime in place, so credits
        // lapsing before the period ends would stay spendable through the
        // cache. Checked here rather than at each call site so that the
        // rollover, which carries deadlines forward too, cannot miss it.
        mustRebuildCounter: isDefined(
          await this.billingCreditGrantService.findEarliestExpiryBefore({
            workspaceId,
            boundary: subscription.currentPeriodEnd,
          }),
        ),
      });
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'currentBillingSubscription',
    ]);

    const isPureReplay = isReplay && availableDeltaMicro === 0;

    if (!isPureReplay) {
      await this.usageLimitQuotaService.dropAllowanceCounter(workspaceId);
    }
  }

  private async adjustAvailableCreditsCounter({
    workspaceId,
    periodStart,
    periodEnd,
    availableDeltaMicro,
    isReplay,
    adjustmentKey,
    mustRebuildCounter,
  }: {
    workspaceId: string;
    periodStart: Date;
    periodEnd: Date;
    availableDeltaMicro: number;
    isReplay: boolean;
    adjustmentKey?: string;
    mustRebuildCounter: boolean;
  }): Promise<void> {
    const rebuildCounter =
      mustRebuildCounter ||
      (isReplay &&
        (!isDefined(adjustmentKey) ||
          !(await this.billingUsageCacheService.hasCounterAdjustmentBeenApplied(
            workspaceId,
            adjustmentKey,
          ))));

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
        periodEnd,
      );
    }
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
}

// Exact 24-hour days rather than calendar ones: the result is only ever
// compared against UTC period boundaries, and local-time day arithmetic drifts
// by an hour across a DST change.
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const buildRevocationAdjustmentKey = (grantId: string): string =>
  `revoke:${grantId}`;

// Null unless the caller asked for a time-boxed grant, and then a period end
// rather than the exact day, for the reasons alignGrantExpiryToPeriodEnd
// documents.
//
// Refuses rather than falling back to null when there is no period to align to:
// returning null there would read as "no expiry" and hand out credits that
// never lapse, which is the opposite of what was asked for and cannot be
// noticed from the result.
const resolveGrantExpiry = ({
  effectiveAt,
  expiresInDays,
  subscription,
  workspaceId,
}: {
  effectiveAt: Date;
  expiresInDays: number | null | undefined;
  subscription: BillingSubscriptionEntity | undefined;
  workspaceId: string;
}): Date | null => {
  if (!isDefined(expiresInDays)) {
    return null;
  }

  if (!isDefined(subscription)) {
    throw new BillingException(
      `Cannot grant credits to workspace ${workspaceId} expiring in ${expiresInDays} days: it has no subscription, so there is no billing period to expire them at`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    );
  }

  return alignGrantExpiryToPeriodEnd({
    requestedExpiresAt: new Date(
      effectiveAt.getTime() + expiresInDays * MILLISECONDS_PER_DAY,
    ),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    interval: subscription.interval,
  });
};

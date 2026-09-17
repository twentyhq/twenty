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
    const { workspaceId } = params;

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
        isReplay: true,
      });

      return alreadyWrittenGrant;
    }

    await this.refreshWorkspaceCreditState({ workspaceId });

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

    await this.refreshWorkspaceCreditState({
      workspaceId,
      isReplay: !wasRevokedNow,
    });

    return grant;
  }

  // A replay changed nothing in the ledger, so the warm allowance counter is
  // still right and dropping it would only force a needless rewarm.
  async refreshWorkspaceCreditState({
    workspaceId,
    isReplay = false,
  }: {
    workspaceId: string;
    isReplay?: boolean;
  }): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'currentBillingSubscription',
    ]);

    if (!isReplay) {
      await this.usageLimitQuotaService.dropAllowanceCounter(workspaceId);
    }
  }
}

// Exact 24-hour days rather than calendar ones: the result is only ever
// compared against UTC period boundaries, and local-time day arithmetic drifts
// by an hour across a DST change.
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

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

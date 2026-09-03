/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { addDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';

// Used when a workspace has no subscription yet, which happens for rewards
// granted during signup. The next period transition re-emits the unspent part
// aligned on the real billing period.
const PROVISIONAL_GRANT_VALIDITY_IN_DAYS = 31;

type GrantCreditsParams = {
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
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async grantCredits(
    params: GrantCreditsParams,
  ): Promise<BillingCreditGrantEntity | null> {
    if (!this.billingService.isBillingEnabled()) {
      return null;
    }

    const { workspaceId } = params;

    return this.cacheLockService.withLock(
      () => this.writeGrantAndDropCounter(params),
      buildBillingCreditStateLockKey(workspaceId),
    );
  }

  private async writeGrantAndDropCounter(
    params: GrantCreditsParams,
  ): Promise<BillingCreditGrantEntity | null> {
    const { workspaceId } = params;

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    const { effectiveAt, expiresAt } = computeGrantValidity(
      params,
      subscription,
    );

    const grant = await this.billingCreditGrantService.createGrant({
      ...params,
      effectiveAt,
      expiresAt,
    });

    await this.usageLimitQuotaService.dropAllowanceCounter(workspaceId);

    if (!isDefined(grant)) {
      this.logger.log(
        `Replayed credit grant for workspace ${workspaceId} (idempotency key ${params.idempotencyKey})`,
      );

      return null;
    }

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
    return this.cacheLockService.withLock(async () => {
      const { grant } = await this.billingCreditGrantService.revokeGrant({
        workspaceId,
        grantId,
        revokedByUserId,
      });

      await this.usageLimitQuotaService.dropAllowanceCounter(workspaceId);

      return grant;
    }, buildBillingCreditStateLockKey(workspaceId));
  }
}

const computeGrantValidity = (
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

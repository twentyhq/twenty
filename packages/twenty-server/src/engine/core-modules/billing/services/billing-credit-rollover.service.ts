/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { computeCarryForwardGrants } from 'src/engine/core-modules/billing/utils/compute-carry-forward-grants.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type ProcessRolloverParams = {
  workspaceId: string;
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  closingAllowanceMicro: number;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  nextAllowanceMicro: number;
};

// The transition writes more rows than a single grant does, so it is given more
// room than the lock's default before it gives up.
const ROLLOVER_LOCK_OPTIONS = { ms: 200, maxRetries: 50, ttl: 30_000 };

@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingCreditService: BillingCreditService,
    private readonly cacheLockService: CacheLockService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async processRolloverOnPeriodTransition(
    params: ProcessRolloverParams,
  ): Promise<void> {
    const { workspaceId, closingPeriodStart, closingPeriodEnd } = params;

    // Read outside the lock: usage comes from ClickHouse and no credit write
    // can change it, so paying that latency while holding the lock would only
    // stall concurrent grants.
    const usageMicro =
      await this.billingUsageService.getCreditsUsedBetweenOrNull({
        workspaceId,
        from: closingPeriodStart,
        to: closingPeriodEnd,
      });

    // Reading usage as zero when the query failed would roll a full unused
    // allowance over to every workspace invoiced during the outage. Throwing
    // fails the webhook so Stripe redelivers it; returning normally would
    // answer 200 and the transition would never run, closing no grants and
    // carrying nothing forward, so the workspace silently loses its balance
    // at expiry.
    if (!isDefined(usageMicro)) {
      throw new BillingException(
        `Cannot roll credits over for workspace ${workspaceId}: usage for the period starting ${closingPeriodStart.toISOString()} could not be read`,
        BillingExceptionCode.BILLING_USAGE_UNAVAILABLE,
      );
    }

    // Everything from here reads the ledger, decides from that snapshot, then
    // writes it back. A grant landing in between would either be carried twice
    // or dropped, so the whole read-decide-write runs alone.
    await this.cacheLockService.withLock(
      () => this.carryGrantsForward({ ...params, usageMicro }),
      buildBillingCreditStateLockKey(workspaceId),
      ROLLOVER_LOCK_OPTIONS,
    );
  }

  private async carryGrantsForward({
    workspaceId,
    closingPeriodStart,
    closingPeriodEnd,
    closingAllowanceMicro,
    nextPeriodStart,
    nextPeriodEnd,
    nextAllowanceMicro,
    usageMicro,
  }: ProcessRolloverParams & { usageMicro: number }): Promise<void> {
    await this.billingCreditGrantService.materializeLegacyBalance({
      workspaceId,
      effectiveAt: closingPeriodStart,
      expiresAt: closingPeriodEnd,
    });

    const closingGrants =
      await this.billingCreditGrantService.findGrantsLiveDuringPeriod({
        workspaceId,
        periodStart: closingPeriodStart,
        periodEnd: closingPeriodEnd,
      });

    const rolloverCapMultiplier = this.twentyConfigService.get(
      'BILLING_ROLLOVER_TOTAL_CAP_MULTIPLIER',
    );

    const carryForwardGrants = computeCarryForwardGrants({
      allowanceMicro: closingAllowanceMicro,
      liveGrants: closingGrants.map((grant) => ({
        grantId: grant.id,
        type: grant.type,
        amountMicro: grant.amountMicro,
        createdAt: grant.createdAt,
      })),
      usageMicro,
      rolloverCapMicro: (rolloverCapMultiplier - 1) * nextAllowanceMicro,
    });

    await this.billingCreditGrantService.closeGrantsAtPeriodEnd({
      workspaceId,
      periodEnd: closingPeriodEnd,
    });

    let carriedForwardMicro = 0;
    let hasReplayedGrant = false;

    // Writes the grants directly rather than through grantCredits: the cache,
    // cap flag and workspace cache only need refreshing once for the whole
    // transition, and this runs inside a Stripe webhook.
    for (const carryForwardGrant of carryForwardGrants) {
      const grant = await this.billingCreditGrantService.createGrant({
        workspaceId,
        amountMicro: carryForwardGrant.amountMicro,
        type: carryForwardGrant.type,
        sourceGrantId: carryForwardGrant.sourceGrantId,
        effectiveAt: nextPeriodStart,
        expiresAt: nextPeriodEnd,
        reason: `Carried over from the period starting ${closingPeriodStart.toISOString()}`,
        idempotencyKey: buildCarryForwardIdempotencyKey({
          workspaceId,
          nextPeriodStart,
          type: carryForwardGrant.type,
          sourceGrantId: carryForwardGrant.sourceGrantId,
        }),
      });

      if (isDefined(grant)) {
        carriedForwardMicro += grant.amountMicro;
      } else {
        hasReplayedGrant = true;
      }
    }

    // A replay only tells us the rows already exist, not whether the delivery
    // that wrote them got as far as the counter. Stripe also redelivers events
    // it already handled successfully, and rebuilding then would throw away a
    // correct warm counter and recompute it from ClickHouse, crediting back
    // whatever usage has not been ingested yet. So the transition records under
    // adjustmentKey that it moved the counter, and the refresh rebuilds only
    // when that record is absent.
    //
    // Runs unconditionally: closing the old grants moves the balance on its
    // own, so a period where everything was spent still needs the refresh.
    await this.billingCreditService.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: carriedForwardMicro,
      isReplay: hasReplayedGrant,
      adjustmentKey: buildRolloverAdjustmentKey(nextPeriodStart),
    });
  }
}

// Scopes the completion marker to one period transition, so only a redelivery
// of that transition can see it.
const buildRolloverAdjustmentKey = (nextPeriodStart: Date): string =>
  `rollover:${nextPeriodStart.toISOString()}`;

// Stripe redelivers webhooks, so the whole transition has to be replayable.
const buildCarryForwardIdempotencyKey = ({
  workspaceId,
  nextPeriodStart,
  type,
  sourceGrantId,
}: {
  workspaceId: string;
  nextPeriodStart: Date;
  type: string;
  sourceGrantId: string | null;
}): string =>
  `carry-forward:${workspaceId}:${nextPeriodStart.toISOString()}:${type}:${
    sourceGrantId ?? 'allowance'
  }`;

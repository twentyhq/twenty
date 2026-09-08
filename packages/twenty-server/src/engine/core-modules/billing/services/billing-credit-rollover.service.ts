/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, type EntityManager } from 'typeorm';

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

type ProcessRolloverParams = {
  workspaceId: string;
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  closingAllowanceMicro: number;
  nextPeriodStart: Date;
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    nextAllowanceMicro,
    usageMicro,
  }: ProcessRolloverParams & { usageMicro: number }): Promise<void> {
    const rolloverCapMultiplier = this.twentyConfigService.get(
      'BILLING_ROLLOVER_TOTAL_CAP_MULTIPLIER',
    );

    // Closing the old grants and writing their successors is one settlement:
    // committing the first half alone would leave the workspace with every
    // grant closed and nothing carrying the unspent part forward.
    const { carriedForwardMicro, hasReplayedGrant } =
      await this.dataSource.transaction(async (entityManager) =>
        this.settleGrants({
          entityManager,
          workspaceId,
          closingPeriodStart,
          closingPeriodEnd,
          closingAllowanceMicro,
          nextPeriodStart,
          usageMicro,
          rolloverCapMicro: (rolloverCapMultiplier - 1) * nextAllowanceMicro,
        }),
      );

    await this.billingCreditService.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: carriedForwardMicro,
      isReplay: hasReplayedGrant,
      adjustmentKey: buildRolloverAdjustmentKey(nextPeriodStart),
    });
  }

  private async settleGrants({
    entityManager,
    workspaceId,
    closingPeriodStart,
    closingPeriodEnd,
    closingAllowanceMicro,
    nextPeriodStart,
    usageMicro,
    rolloverCapMicro,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    closingPeriodStart: Date;
    closingPeriodEnd: Date;
    closingAllowanceMicro: number;
    nextPeriodStart: Date;
    usageMicro: number;
    rolloverCapMicro: number;
  }): Promise<{ carriedForwardMicro: number; hasReplayedGrant: boolean }> {
    const closingGrants =
      await this.billingCreditGrantService.findGrantsLiveDuringPeriod(
        {
          workspaceId,
          periodStart: closingPeriodStart,
          periodEnd: closingPeriodEnd,
        },
        entityManager,
      );

    const carryForwardGrants = computeCarryForwardGrants({
      allowanceMicro: closingAllowanceMicro,
      liveGrants: closingGrants.map((grant) => ({
        grantId: grant.id,
        type: grant.type,
        amountMicro: grant.amountMicro,
        createdAt: grant.createdAt,
        expiresAt: grant.expiresAt,
      })),
      usageMicro,
      rolloverCapMicro,
      boundary: closingPeriodEnd,
    });

    await this.billingCreditGrantService.closeGrantsAtPeriodEnd(
      { workspaceId, periodEnd: closingPeriodEnd },
      entityManager,
    );

    let carriedForwardMicro = 0;
    let hasReplayedGrant = false;

    for (const carryForwardGrant of carryForwardGrants) {
      const grant = await this.billingCreditGrantService.createGrant(
        {
          workspaceId,
          amountMicro: carryForwardGrant.amountMicro,
          type: carryForwardGrant.type,
          sourceGrantId: carryForwardGrant.sourceGrantId,
          effectiveAt: nextPeriodStart,
          // Null for everything but a time-boxed grant, whose deadline the
          // successor inherits. Stamping the period end here instead would make
          // every balance depend on the next transition running, which is the
          // failure this settlement exists to survive.
          expiresAt: carryForwardGrant.expiresAt,
          reason: `Carried over from the period starting ${closingPeriodStart.toISOString()}`,
          idempotencyKey: buildCarryForwardIdempotencyKey({
            workspaceId,
            nextPeriodStart,
            type: carryForwardGrant.type,
            sourceGrantId: carryForwardGrant.sourceGrantId,
          }),
        },
        entityManager,
      );

      if (isDefined(grant)) {
        carriedForwardMicro += grant.amountMicro;
      } else {
        hasReplayedGrant = true;
      }
    }

    return { carriedForwardMicro, hasReplayedGrant };
  }
}

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

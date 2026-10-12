/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { i18n } from '@lingui/core';
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

// The transition writes more rows than a single grant, so it gets more lock room than the default
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

    // Outside the lock: no credit write changes ClickHouse usage, and its latency would stall grants
    const usageMicro =
      await this.billingUsageService.getCreditsUsedBetweenOrNull({
        workspaceId,
        from: closingPeriodStart,
        to: closingPeriodEnd,
      });

    // Throw so Stripe redelivers: zero usage would roll a full allowance over, and a 200 never reruns the transition
    if (!isDefined(usageMicro)) {
      throw new BillingException(
        `Cannot roll credits over for workspace ${workspaceId}: usage for the period starting ${closingPeriodStart.toISOString()} could not be read`,
        BillingExceptionCode.BILLING_USAGE_UNAVAILABLE,
      );
    }

    // Read-decide-write runs alone: a grant landing in between would be carried twice or dropped
    await this.cacheLockService.withLock(
      () => this.carryGrantsForward({ ...params, usageMicro }),
      buildBillingCreditStateLockKey(workspaceId),
      ROLLOVER_LOCK_OPTIONS,
    );
  }

  private async carryGrantsForward(
    params: ProcessRolloverParams & { usageMicro: number },
  ): Promise<void> {
    const { workspaceId, nextAllowanceMicro } = params;

    const rolloverCapMultiplier = this.twentyConfigService.get(
      'BILLING_ROLLOVER_TOTAL_CAP_MULTIPLIER',
    );

    // One transaction: closing grants without their successors loses the unspent credits
    await this.dataSource.transaction(async (entityManager) =>
      this.settleGrants({
        ...params,
        entityManager,
        rolloverCapMicro: (rolloverCapMultiplier - 1) * nextAllowanceMicro,
      }),
    );

    await this.billingCreditService.refreshWorkspaceCreditState(workspaceId);
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
  }: ProcessRolloverParams & {
    usageMicro: number;
    rolloverCapMicro: number;
    entityManager: EntityManager;
  }): Promise<void> {
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

    for (const carryForwardGrant of carryForwardGrants) {
      await this.billingCreditGrantService.createGrant(
        {
          workspaceId,
          amountMicro: carryForwardGrant.amountMicro,
          type: carryForwardGrant.type,
          sourceGrantId: carryForwardGrant.sourceGrantId,
          effectiveAt: nextPeriodStart,
          // Inherited rather than stamped with the period end: balances must not depend on the next transition running
          expiresAt: carryForwardGrant.expiresAt,
          // UTC: Stripe boundaries are UTC instants, and local-zone midnight dates to the previous day
          reason: `Carried over from the period starting ${i18n.date(
            closingPeriodStart,
            { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
          )}`,
          idempotencyKey: buildCarryForwardIdempotencyKey({
            workspaceId,
            nextPeriodStart,
            type: carryForwardGrant.type,
            sourceGrantId: carryForwardGrant.sourceGrantId,
          }),
        },
        entityManager,
      );
    }
  }
}

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

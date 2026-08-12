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

    const usageMicro =
      await this.billingUsageService.getCreditsUsedBetweenOrNull({
        workspaceId,
        from: closingPeriodStart,
        to: closingPeriodEnd,
      });

    if (!isDefined(usageMicro)) {
      throw new BillingException(
        `Cannot roll credits over for workspace ${workspaceId}: usage for the period starting ${closingPeriodStart.toISOString()} could not be read`,
        BillingExceptionCode.BILLING_USAGE_UNAVAILABLE,
      );
    }

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

    await this.billingCreditService.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: carriedForwardMicro,
      addsCredits: true,
      isReplay: hasReplayedGrant,
      adjustmentKey: buildRolloverAdjustmentKey(nextPeriodStart),
    });
  }
}

const buildRolloverAdjustmentKey = (nextPeriodStart: Date): string =>
  `rollover:${nextPeriodStart.toISOString()}`;

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

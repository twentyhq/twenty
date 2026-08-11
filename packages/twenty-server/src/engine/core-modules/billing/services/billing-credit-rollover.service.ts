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
import { computeCarryForwardGrants } from 'src/engine/core-modules/billing/utils/compute-carry-forward-grants.util';
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

@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingCreditService: BillingCreditService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async processRolloverOnPeriodTransition({
    workspaceId,
    closingPeriodStart,
    closingPeriodEnd,
    closingAllowanceMicro,
    nextPeriodStart,
    nextPeriodEnd,
    nextAllowanceMicro,
  }: ProcessRolloverParams): Promise<void> {
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
        id: grant.id,
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

    // Runs unconditionally: closing the old grants moves the balance on its
    // own, so a period where everything was spent still needs the refresh.
    //
    // A replayed grant means a previous delivery inserted the rows and then
    // failed, so this delivery adds nothing to carriedForwardMicro and a delta
    // of zero would leave the carried credits out of the counter for the whole
    // period. Rebuild from the ledger instead.
    await this.billingCreditService.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: carriedForwardMicro,
      rebuildCounter: hasReplayedGrant,
      shouldClearCap: hasReplayedGrant || carriedForwardMicro > 0,
    });
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

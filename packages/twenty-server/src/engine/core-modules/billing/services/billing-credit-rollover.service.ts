/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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
  private readonly logger = new Logger(BillingCreditRolloverService.name);

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
    // allowance over to every workspace invoiced during the outage. Stripe
    // retries the webhook, so skipping is recoverable and giving credits away
    // is not.
    if (!isDefined(usageMicro)) {
      this.logger.error(
        `Skipped credit rollover for workspace ${workspaceId}: usage for the period starting ${closingPeriodStart.toISOString()} could not be read`,
      );

      return;
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
      }
    }

    // Runs unconditionally: closing the old grants moves the balance on its
    // own, so a period where everything was spent still needs the refresh.
    await this.billingCreditService.refreshWorkspaceCreditState({
      workspaceId,
      availableDeltaMicro: carriedForwardMicro,
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

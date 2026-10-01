/* @license Enterprise */

import { MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_PERIOD } from 'twenty-shared/application';

import {
  type DeclaredRecurringCharge,
  type RejectedRecurringCharge,
} from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';

type BuildRecurringChargeUsageEventsParams = {
  dueCharges: DeclaredRecurringCharge[];
  workspaceMemberCount: number;
  periodStart: Date;
};

export type BuildRecurringChargeUsageEventsResult = {
  events: UsageEvent[];
  rejectedCharges: RejectedRecurringCharge[];
};

// No members raises nothing: a zero-credit row would count as charged and suppress the next attempt
// Over-cap totals are dropped, not clamped: raising another amount than declared is silent mispricing
export const buildRecurringChargeUsageEvents = ({
  dueCharges,
  workspaceMemberCount,
  periodStart,
}: BuildRecurringChargeUsageEventsParams): BuildRecurringChargeUsageEventsResult => {
  const events: UsageEvent[] = [];
  const rejectedCharges: RejectedRecurringCharge[] = [];

  for (const { applicationId, chargeKey, charge } of dueCharges) {
    const isPerMember = charge.per === 'WORKSPACE_MEMBER';
    const quantity = isPerMember ? workspaceMemberCount : 1;

    if (quantity <= 0) {
      continue;
    }

    const creditsUsedMicro = charge.amountMicroCredits * quantity;

    if (creditsUsedMicro > MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_PERIOD) {
      rejectedCharges.push({
        applicationId,
        chargeKey,
        reason: `charge of ${creditsUsedMicro} micro-credits (${charge.amountMicroCredits} x ${quantity}) exceeds the ${MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_PERIOD} per-period maximum`,
      });
      continue;
    }

    events.push({
      resourceType: UsageResourceType.APP,
      operationType: UsageOperationType.SUBSCRIPTION,
      creditsUsedMicro,
      quantity,
      unit: isPerMember ? UsageUnit.SEAT : UsageUnit.CREDIT,
      resourceId: applicationId,
      resourceContext: chargeKey,
      spenders: { applicationId },
      periodStart,
    } satisfies UsageEvent);
  }

  return { events, rejectedCharges };
};

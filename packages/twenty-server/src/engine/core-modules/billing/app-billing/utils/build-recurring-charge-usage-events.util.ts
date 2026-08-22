/* @license Enterprise */

import { type DueRecurringCharge } from 'src/engine/core-modules/billing/app-billing/utils/collect-due-recurring-charges.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';

type BuildRecurringChargeUsageEventsParams = {
  dueCharges: DueRecurringCharge[];
  workspaceMemberCount: number;
  periodStart: Date;
};

export const isPerWorkspaceMemberCharge = ({
  charge,
}: DueRecurringCharge): boolean => charge.per === 'WORKSPACE_MEMBER';

// A per-member charge multiplies by the member count at the moment the period is
// raised, so a workspace with no members raises nothing rather than a zero-credit
// row that would still count as charged and suppress the next attempt.
export const buildRecurringChargeUsageEvents = ({
  dueCharges,
  workspaceMemberCount,
  periodStart,
}: BuildRecurringChargeUsageEventsParams): UsageEvent[] =>
  dueCharges.flatMap((dueCharge) => {
    const { applicationId, chargeKey, charge } = dueCharge;
    const isPerMember = isPerWorkspaceMemberCharge(dueCharge);
    const quantity = isPerMember ? workspaceMemberCount : 1;

    if (quantity <= 0) {
      return [];
    }

    return [
      {
        resourceType: UsageResourceType.APP,
        operationType: UsageOperationType.SUBSCRIPTION,
        creditsUsedMicro: charge.amountMicroCredits * quantity,
        quantity,
        unit: isPerMember ? UsageUnit.SEAT : UsageUnit.CREDIT,
        resourceId: applicationId,
        resourceContext: chargeKey,
        userWorkspaceId: null,
        periodStart,
      } satisfies UsageEvent,
    ];
  });

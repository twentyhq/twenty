import { isDefined } from 'twenty-shared/utils';

import { buildRecurringChargeUsageEvents } from 'src/engine/core-modules/billing/app-billing/utils/build-recurring-charge-usage-events.util';
import { type DeclaredRecurringCharge } from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const APPLICATION_ID = '20202020-1111-0000-0000-000000000001';
const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');

const FLAT_CHARGE: DeclaredRecurringCharge = {
  applicationId: APPLICATION_ID,
  chargeKey: 'platformFee',
  charge: {
    period: 'MONTH',
    amountMicroCredits: 20_000_000,
    label: 'Platform fee',
  },
};

const SEAT_CHARGE: DeclaredRecurringCharge = {
  applicationId: APPLICATION_ID,
  chargeKey: 'seat',
  charge: {
    period: 'MONTH',
    amountMicroCredits: 5_000_000,
    per: 'WORKSPACE_MEMBER',
    label: 'Per member',
  },
};

describe('buildRecurringChargeUsageEvents', () => {
  it('should raise a flat charge once, in credits', () => {
    expect(
      buildRecurringChargeUsageEvents({
        dueCharges: [FLAT_CHARGE],
        workspaceMemberCount: 3,
        periodStart: PERIOD_START,
      }),
    ).toEqual([
      {
        resourceType: UsageResourceType.APP,
        operationType: UsageOperationType.SUBSCRIPTION,
        creditsUsedMicro: 20_000_000,
        quantity: 1,
        unit: UsageUnit.CREDIT,
        resourceId: APPLICATION_ID,
        resourceContext: 'platformFee',
        spenders: { applicationId: APPLICATION_ID },
        periodStart: PERIOD_START,
      },
    ]);
  });

  it('should multiply a per member charge by the member count, in seats', () => {
    expect(
      buildRecurringChargeUsageEvents({
        dueCharges: [SEAT_CHARGE],
        workspaceMemberCount: 3,
        periodStart: PERIOD_START,
      }),
    ).toEqual([
      {
        resourceType: UsageResourceType.APP,
        operationType: UsageOperationType.SUBSCRIPTION,
        creditsUsedMicro: 15_000_000,
        quantity: 3,
        unit: UsageUnit.SEAT,
        resourceId: APPLICATION_ID,
        resourceContext: 'seat',
        spenders: { applicationId: APPLICATION_ID },
        periodStart: PERIOD_START,
      },
    ]);
  });

  it('should raise nothing for a per member charge when the workspace has no members', () => {
    expect(
      buildRecurringChargeUsageEvents({
        dueCharges: [SEAT_CHARGE],
        workspaceMemberCount: 0,
        periodStart: PERIOD_START,
      }),
    ).toEqual([]);
  });

  it('should still raise the flat charge when a per member charge is dropped', () => {
    const result = buildRecurringChargeUsageEvents({
      dueCharges: [FLAT_CHARGE, SEAT_CHARGE],
      workspaceMemberCount: 0,
      periodStart: PERIOD_START,
    });

    expect(result).toEqual([
      expect.objectContaining({ resourceContext: 'platformFee', quantity: 1 }),
    ]);
  });

  it('should attribute to the application only, never to a member', () => {
    const result = buildRecurringChargeUsageEvents({
      dueCharges: [FLAT_CHARGE, SEAT_CHARGE],
      workspaceMemberCount: 2,
      periodStart: PERIOD_START,
    });

    expect(
      result.every((event) => !isDefined(event.spenders?.userWorkspaceId)),
    ).toBe(true);
    expect(
      result.every((event) => event.spenders?.applicationId === APPLICATION_ID),
    ).toBe(true);
    expect(result.every((event) => event.resourceId === APPLICATION_ID)).toBe(
      true,
    );
  });

  it('should return no events when nothing is due', () => {
    expect(
      buildRecurringChargeUsageEvents({
        dueCharges: [],
        workspaceMemberCount: 5,
        periodStart: PERIOD_START,
      }),
    ).toEqual([]);
  });
});

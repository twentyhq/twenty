import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { findBindingUserAllowance } from 'src/engine/core-modules/usage-limit/utils/find-binding-user-allowance.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildUserAllowanceCounter = ({
  periodUnit,
  limitValue,
  periodEnd,
}: Pick<
  UserAllowanceQuotaCounter,
  'periodUnit' | 'limitValue' | 'periodEnd'
>): UserAllowanceQuotaCounter => ({
  kind: 'userAllowance',
  isDefault: true,
  key: `user-allowance-${periodUnit}`,
  limitValue,
  unit: UsageUnit.USER_CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit,
  periodStart: new Date('2026-08-24T00:00:00.000Z'),
  periodEnd,
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
  operationTypes: [UsageOperationType.ALL],
  fallback: 'WORKSPACE_CREDITS',
});

const dayCounter = buildUserAllowanceCounter({
  periodUnit: 'day',
  limitValue: 10,
  periodEnd: new Date('2026-08-25T00:00:00.000Z'),
});

const weekCounter = buildUserAllowanceCounter({
  periodUnit: 'week',
  limitValue: 50,
  periodEnd: new Date('2026-08-31T00:00:00.000Z'),
});

describe('findBindingUserAllowance', () => {
  it('returns the window with the least room left while none is exhausted', () => {
    expect(
      findBindingUserAllowance({
        userAllowanceCounters: [dayCounter, weekCounter],
        userAllowanceConsumedValues: [2, 45],
      }),
    ).toEqual({ counter: weekCounter, consumedValue: 45, isExhausted: false });
  });

  it('returns the exhausted window that renews last', () => {
    expect(
      findBindingUserAllowance({
        userAllowanceCounters: [dayCounter, weekCounter],
        userAllowanceConsumedValues: [10, 50],
      }),
    ).toEqual({ counter: weekCounter, consumedValue: 50, isExhausted: true });
  });

  it('reports an exhausted window even when another one has room', () => {
    expect(
      findBindingUserAllowance({
        userAllowanceCounters: [dayCounter, weekCounter],
        userAllowanceConsumedValues: [10, 20],
      }),
    ).toEqual({ counter: dayCounter, consumedValue: 10, isExhausted: true });
  });

  it('counts an unread window as unused', () => {
    expect(
      findBindingUserAllowance({
        userAllowanceCounters: [dayCounter, weekCounter],
        userAllowanceConsumedValues: [null, null],
      }),
    ).toEqual({ counter: dayCounter, consumedValue: null, isExhausted: false });
  });

  it('returns null without a user allowance', () => {
    expect(
      findBindingUserAllowance({
        userAllowanceCounters: [],
        userAllowanceConsumedValues: [],
      }),
    ).toBeNull();
  });
});

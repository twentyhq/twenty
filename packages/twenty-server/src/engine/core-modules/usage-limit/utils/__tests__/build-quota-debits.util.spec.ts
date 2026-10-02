import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const allowanceCounter: AllowanceQuotaCounter = {
  kind: 'allowance',
  key: 'allowance',
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const buildLimitCounter = (unit: UsageUnit): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: false,
  key: unit,
  limitValue: 1_000,
  unit,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
});

describe('buildQuotaDebits', () => {
  it('debits each counter the amount of its own unit', () => {
    const creditCounter = buildLimitCounter(UsageUnit.CREDIT);
    const invocationCounter = buildLimitCounter(UsageUnit.INVOCATION);
    const runtimeCounter = buildLimitCounter(UsageUnit.MILLISECOND);

    expect(
      buildQuotaDebits({
        counters: [
          allowanceCounter,
          creditCounter,
          invocationCounter,
          runtimeCounter,
        ],
        cost: {
          [UsageUnit.CREDIT]: 2_500,
          [UsageUnit.INVOCATION]: 1,
          [UsageUnit.MILLISECOND]: 15_000,
        },
      }),
    ).toEqual([
      { counter: allowanceCounter, amount: 2_500 },
      { counter: creditCounter, amount: 2_500 },
      { counter: invocationCounter, amount: 1 },
      { counter: runtimeCounter, amount: 15_000 },
    ]);
  });

  it('drops a counter whose unit the cost leaves out', () => {
    expect(
      buildQuotaDebits({
        counters: [buildLimitCounter(UsageUnit.MILLISECOND)],
        cost: { [UsageUnit.CREDIT]: 2_500, [UsageUnit.INVOCATION]: 1 },
      }),
    ).toEqual([]);
  });

  it('drops a counter whose unit costs zero', () => {
    expect(
      buildQuotaDebits({
        counters: [buildLimitCounter(UsageUnit.MILLISECOND)],
        cost: { [UsageUnit.CREDIT]: 2_500, [UsageUnit.MILLISECOND]: 0 },
      }),
    ).toEqual([]);
  });

  it('debits only the run counter for an exempt run, leaving the allowance alone', () => {
    const invocationCounter = buildLimitCounter(UsageUnit.INVOCATION);

    expect(
      buildQuotaDebits({
        counters: [allowanceCounter, invocationCounter],
        cost: {
          [UsageUnit.CREDIT]: 0,
          [UsageUnit.INVOCATION]: 1,
          [UsageUnit.MILLISECOND]: 0,
        },
      }),
    ).toEqual([{ counter: invocationCounter, amount: 1 }]);
  });
});

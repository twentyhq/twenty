import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { computeCounterBudget } from 'src/engine/core-modules/usage-limit/utils/compute-counter-budget.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_START = new Date('2026-08-15T09:00:00.000Z');
const PERIOD_END = new Date('2026-09-15T09:00:00.000Z');

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  key: 'counter-key',
  limitValueType: 'allowancePercent',
  limitValue: 40,
  meter: 'creditsUsedMicro',
  resourceType: UsageResourceType.AI,
  periodUnit: 'allowancePeriod',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
  operationType: UsageOperationType.ALL,
  ...overrides,
});

const allowance = {
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  allowanceMicro: 2_000_001,
};

describe('computeCounterBudget', () => {
  it('takes the percent of the allowance, rounded down to whole micros', () => {
    expect(computeCounterBudget({ counter: buildCounter(), allowance })).toBe(
      800_000,
    );
  });

  it('keeps an absolute limit as is, allowance or not', () => {
    const counter = buildCounter({
      limitValueType: 'absolute',
      limitValue: 1_000,
      periodUnit: 'month',
    });

    expect(computeCounterBudget({ counter, allowance: null })).toBe(1_000);
    expect(computeCounterBudget({ counter, allowance })).toBe(1_000);
  });

  it('has no budget for a percent when the allowance is gone', () => {
    expect(
      computeCounterBudget({ counter: buildCounter(), allowance: null }),
    ).toBeNull();
  });

  it('has no budget for a percent of another period', () => {
    expect(
      computeCounterBudget({
        counter: buildCounter(),
        allowance: {
          ...allowance,
          periodStart: new Date('2026-09-15T09:00:00.000Z'),
        },
      }),
    ).toBeNull();
  });
});

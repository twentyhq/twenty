import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const buildAllowanceCounter = (key: string): AllowanceQuotaCounter => ({
  kind: 'allowance',
  key,
  limitValue: 5_000,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
});

const buildLimitCounter = (
  key: string,
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  usageLimitId: 'limit-1',
  isDefault: false,
  isEnforced: true,
  key,
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

describe('findExhaustedCounters', () => {
  it('picks every counter at or past its cap', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildLimitCounter('under'),
          buildLimitCounter('at'),
          buildAllowanceCounter('past'),
        ],
        consumedValues: [999, 1_000, 6_000],
      }),
    ).toMatchObject([{ key: 'at' }, { key: 'past' }]);
  });

  it('skips cold counters', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('cold'), buildAllowanceCounter('cold')],
        consumedValues: [null, null],
      }),
    ).toEqual([]);
  });

  it('skips a limit that is not enforced, however far past its cap', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('metered', { isEnforced: false })],
        consumedValues: [5_000],
      }),
    ).toEqual([]);
  });

  it('admits a cost that fits the cap exactly and refuses one unit more', () => {
    const counters = [buildLimitCounter('limit'), buildAllowanceCounter('cap')];

    expect(
      findExhaustedCounters({
        counters,
        consumedValues: [900, 4_900],
        cost: { [UsageUnit.CREDIT]: 100 },
      }),
    ).toEqual([]);
    expect(
      findExhaustedCounters({
        counters,
        consumedValues: [900, 4_900],
        cost: { [UsageUnit.CREDIT]: 101 },
      }),
    ).toMatchObject([{ key: 'limit' }, { key: 'cap' }]);
  });

  it('charges a limit only for the unit it counts', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildLimitCounter('credits'),
          buildLimitCounter('tokens', { unit: UsageUnit.TOKEN }),
        ],
        consumedValues: [990, 990],
        cost: { [UsageUnit.CREDIT]: 0, [UsageUnit.TOKEN]: 500 },
      }),
    ).toMatchObject([{ key: 'tokens' }]);
  });

  it('counts a unit missing from the cost as zero', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('tokens', { unit: UsageUnit.TOKEN })],
        consumedValues: [990],
        cost: { [UsageUnit.CREDIT]: 5_000 },
      }),
    ).toEqual([]);
  });
});

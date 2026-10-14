import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const buildWorkspaceAllowanceCounter = (
  key: string,
): WorkspaceAllowanceQuotaCounter => ({
  kind: 'workspaceAllowance',
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
  isDefault: false,
  key,
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
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
          buildWorkspaceAllowanceCounter('past'),
        ],
        consumedValues: [999, 1_000, 6_000],
      }),
    ).toMatchObject([{ key: 'at' }, { key: 'past' }]);
  });

  it('skips cold counters', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildLimitCounter('cold'),
          buildWorkspaceAllowanceCounter('cold'),
        ],
        consumedValues: [null, null],
      }),
    ).toEqual([]);
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

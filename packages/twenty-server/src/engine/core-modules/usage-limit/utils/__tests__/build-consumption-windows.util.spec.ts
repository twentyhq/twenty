import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildConsumptionWindows } from 'src/engine/core-modules/usage-limit/utils/build-consumption-windows.util';

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  key: 'counter-key',
  limitValue: 1_000,
  meter: 'creditsUsedMicro',
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: new Date('2026-09-01T00:00:00.000Z'),
  periodEnd: new Date('2026-10-01T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  ...overrides,
});

describe('buildConsumptionWindows', () => {
  it('merges the resource types of a shared period into a single window', () => {
    expect(
      buildConsumptionWindows([
        buildCounter({ resourceType: UsageResourceType.AI }),
        buildCounter({ resourceType: UsageResourceType.APP }),
        buildCounter({ resourceType: UsageResourceType.AI }),
      ]),
    ).toEqual([
      {
        windowKey: 'month:1788220800000',
        resourceTypes: [UsageResourceType.AI, UsageResourceType.APP],
        periodStart: new Date('2026-09-01T00:00:00.000Z'),
        periodEnd: new Date('2026-10-01T00:00:00.000Z'),
        periodAnchor: 'calendar',
      },
    ]);
  });

  it('keeps one window per period and anchors the allowance period on billing', () => {
    expect(
      buildConsumptionWindows([
        buildCounter({}),
        buildCounter({
          periodUnit: 'week',
          periodStart: new Date('2026-09-07T00:00:00.000Z'),
          periodEnd: new Date('2026-09-14T00:00:00.000Z'),
        }),
        buildCounter({ periodUnit: 'allowancePeriod' }),
      ]),
    ).toMatchObject([
      { windowKey: 'month:1788220800000', periodAnchor: 'calendar' },
      { windowKey: 'week:1788739200000', periodAnchor: 'calendar' },
      { windowKey: 'allowancePeriod:1788220800000', periodAnchor: 'billing' },
    ]);
  });

  it('answers no window without a cold counter', () => {
    expect(buildConsumptionWindows([])).toEqual([]);
  });
});

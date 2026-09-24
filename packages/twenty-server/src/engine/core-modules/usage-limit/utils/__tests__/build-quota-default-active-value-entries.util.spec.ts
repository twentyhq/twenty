import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDefaultActiveValueEntries } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-active-value-entries.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_END = new Date('2026-08-21T00:00:00.000Z');
const NOW = new Date('2026-08-20T06:00:00.000Z').getTime();

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: true,
  key: 'counter-key',
  limitValue: 1_000,
  meter: 'quantity',
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  periodUnit: 'day',
  periodStart: new Date('2026-08-20T00:00:00.000Z'),
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

const buildEntries = ({
  defaultCounters = [buildCounter()],
  activeValueKeys = ['active-key'],
  activeValues,
  now = NOW,
}: {
  defaultCounters?: LimitQuotaCounter[];
  activeValueKeys?: string[];
  activeValues: (number | undefined)[];
  now?: number;
}) =>
  buildQuotaDefaultActiveValueEntries({
    defaultCounters,
    activeValueKeys,
    activeValues,
    now,
  });

describe('buildQuotaDefaultActiveValueEntries', () => {
  it('records the configured value on a first read that found none', () => {
    expect(buildEntries({ activeValues: [undefined] })).toEqual([
      {
        key: 'active-key',
        value: 1_000,
        ttl: PERIOD_END.getTime() - NOW,
      },
    ]);
  });

  it('records the new value once the configured value has moved', () => {
    expect(buildEntries({ activeValues: [500] })).toMatchObject([
      { key: 'active-key', value: 1_000 },
    ]);
  });

  it('writes nothing while the recorded value already matches', () => {
    expect(buildEntries({ activeValues: [1_000] })).toEqual([]);
  });

  it('writes nothing for a period that has already lapsed', () => {
    expect(
      buildEntries({ activeValues: [undefined], now: PERIOD_END.getTime() }),
    ).toEqual([]);
  });

  it('expires the pointer with the period it describes', () => {
    const oneMinuteBeforePeriodEnd = PERIOD_END.getTime() - 60_000;

    expect(
      buildEntries({
        activeValues: [undefined],
        now: oneMinuteBeforePeriodEnd,
      }),
    ).toMatchObject([{ ttl: 60_000 }]);
  });

  it('pairs each entry with the key read for that counter', () => {
    expect(
      buildEntries({
        defaultCounters: [
          buildCounter({ limitValue: 10 }),
          buildCounter({ limitValue: 20 }),
        ],
        activeValueKeys: ['first', 'second'],
        activeValues: [10, undefined],
      }),
    ).toMatchObject([{ key: 'second', value: 20 }]);
  });
});

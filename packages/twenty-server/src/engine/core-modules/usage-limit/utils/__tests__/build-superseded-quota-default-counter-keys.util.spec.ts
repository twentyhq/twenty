import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter-key.util';
import { buildSupersededQuotaDefaultCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-superseded-quota-default-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_START = new Date('2026-08-20T00:00:00.000Z');

const DEFAULT_SCOPE = {
  workspaceId: 'workspace-1',
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  spenderType: 'workspace' as const,
  spenderId: null,
  meter: 'quantity' as const,
  periodUnit: 'day' as const,
  periodStart: PERIOD_START,
};

const buildCounter = (
  overrides: Partial<LimitQuotaCounter> = {},
): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: true,
  key: buildQuotaDefaultCounterKey({ ...DEFAULT_SCOPE, limitValue: 1_000 }),
  limitValue: 1_000,
  meter: 'quantity',
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  periodUnit: 'day',
  periodStart: PERIOD_START,
  periodEnd: new Date('2026-08-21T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

const buildKeys = ({
  defaultCounters = [buildCounter()],
  activeValues,
}: {
  defaultCounters?: LimitQuotaCounter[];
  activeValues: (number | undefined)[];
}) =>
  buildSupersededQuotaDefaultCounterKeys({
    workspaceId: 'workspace-1',
    defaultCounters,
    activeValues,
  });

describe('buildSupersededQuotaDefaultCounterKeys', () => {
  it('retires both the live counter and the one the earlier value left behind', () => {
    expect(buildKeys({ activeValues: [500] })).toEqual([
      buildQuotaDefaultCounterKey({ ...DEFAULT_SCOPE, limitValue: 1_000 }),
      buildQuotaDefaultCounterKey({ ...DEFAULT_SCOPE, limitValue: 500 }),
    ]);
  });

  it('retires nothing while the configured value holds', () => {
    expect(buildKeys({ activeValues: [1_000] })).toEqual([]);
  });

  it('retires nothing on a first read that recorded no value yet', () => {
    expect(buildKeys({ activeValues: [undefined] })).toEqual([]);
  });

  it('retires only the counters whose value moved', () => {
    const held = buildCounter({ key: 'held' });
    const superseded = buildCounter({ key: 'superseded', limitValue: 2_000 });

    expect(
      buildKeys({
        defaultCounters: [held, superseded],
        activeValues: [1_000, 500],
      }),
    ).toEqual([
      'superseded',
      buildQuotaDefaultCounterKey({ ...DEFAULT_SCOPE, limitValue: 500 }),
    ]);
  });

  it('keys the retired counter on the spender the default is scoped to', () => {
    expect(
      buildKeys({
        defaultCounters: [
          buildCounter({ spenderType: 'userWorkspace', spenderId: 'user-1' }),
        ],
        activeValues: [500],
      })[1],
    ).toBe(
      buildQuotaDefaultCounterKey({
        ...DEFAULT_SCOPE,
        spenderType: 'userWorkspace',
        spenderId: 'user-1',
        limitValue: 500,
      }),
    );
  });
});

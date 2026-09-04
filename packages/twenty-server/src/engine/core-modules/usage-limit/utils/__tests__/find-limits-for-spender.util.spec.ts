import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-id',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 100,
  burstValue: null,
  ...overrides,
});

describe('findLimitsForSpender', () => {
  const spender = { spenderType: 'apiKey' as const, spenderId: 'key-1' };

  it('charges a named spender against its own limit and the shared one', () => {
    const shared = buildLimit({ id: 'shared', spenderId: '' });
    const own = buildLimit({ id: 'own', spenderId: 'key-1', limitValue: 50 });

    expect(
      findLimitsForSpender({
        limits: [shared, own],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([shared, own]);
  });

  it('charges a spender with no limit of its own against the shared limit', () => {
    const shared = buildLimit({ id: 'shared', spenderId: '' });

    expect(
      findLimitsForSpender({
        limits: [shared],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([shared]);
  });

  it('applies a limit covering every operation of the resource', () => {
    const wildcard = buildLimit({
      id: 'wildcard',
      operationType: UsageOperationType.ALL,
    });
    const specific = buildLimit({ id: 'specific' });

    expect(
      findLimitsForSpender({
        limits: [wildcard, specific],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([wildcard, specific]);
  });

  it('ignores a limit belonging to another spender', () => {
    const otherKey = buildLimit({ id: 'other', spenderId: 'key-2' });

    expect(
      findLimitsForSpender({
        limits: [otherKey],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('ignores a limit scoped to another spender type', () => {
    const application = buildLimit({
      id: 'application',
      spenderType: 'application',
      spenderId: '',
    });

    expect(
      findLimitsForSpender({
        limits: [application],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('ignores a limit scoped to a different operation', () => {
    const otherOperation = buildLimit({
      spenderId: 'key-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });

    expect(
      findLimitsForSpender({
        limits: [otherOperation],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('returns a burst and a sustained limit together', () => {
    const burst = buildLimit({ id: 'burst', periodCount: 1, limitValue: 20 });
    const sustained = buildLimit({ id: 'sustained', periodCount: 60 });

    expect(
      findLimitsForSpender({
        limits: [burst, sustained],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([burst, sustained]);
  });

  it('keeps every window of the shared limits when the spender has its own limit', () => {
    const sharedBurst = buildLimit({
      id: 'shared-burst',
      periodCount: 1,
      limitValueType: 'absolute',
      limitValue: 20,
    });
    const sharedSustained = buildLimit({ id: 'shared-sustained' });
    const own = buildLimit({
      id: 'own',
      spenderId: 'key-1',
      limitValueType: 'absolute',
      limitValue: 5000,
    });

    expect(
      findLimitsForSpender({
        limits: [sharedBurst, sharedSustained, own],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([sharedBurst, sharedSustained, own]);
  });
});

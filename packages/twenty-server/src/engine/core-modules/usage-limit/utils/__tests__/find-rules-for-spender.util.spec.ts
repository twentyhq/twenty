import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findRulesForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rules-for-spender.util';

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'rule-id',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '',
  limitKind: 'speed',
  windowSeconds: 60,
  limitValueType: 'absolute',
  limitValue: 100,
  burstValue: null,
  ...overrides,
});

describe('findRulesForSpender', () => {
  const spender = { spenderType: 'apiKey' as const, spenderId: 'key-1' };

  it('charges a named spender against its own rule and the shared one', () => {
    const shared = buildRule({ id: 'shared', spenderId: '' });
    const own = buildRule({ id: 'own', spenderId: 'key-1', limitValue: 50 });

    expect(
      findRulesForSpender({
        rules: [shared, own],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([shared, own]);
  });

  it('charges a spender with no rule of its own against the shared rule', () => {
    const shared = buildRule({ id: 'shared', spenderId: '' });

    expect(
      findRulesForSpender({
        rules: [shared],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([shared]);
  });

  it('ignores a rule belonging to another spender', () => {
    const otherKey = buildRule({ id: 'other', spenderId: 'key-2' });

    expect(
      findRulesForSpender({
        rules: [otherKey],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('ignores a rule scoped to another spender type', () => {
    const application = buildRule({
      id: 'application',
      spenderType: 'application',
      spenderId: '',
    });

    expect(
      findRulesForSpender({
        rules: [application],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('ignores a rule scoped to a different operation', () => {
    const otherOperation = buildRule({
      spenderId: 'key-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });

    expect(
      findRulesForSpender({
        rules: [otherOperation],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([]);
  });

  it('returns a burst and a sustained rule together', () => {
    const burst = buildRule({ id: 'burst', windowSeconds: 1, limitValue: 20 });
    const sustained = buildRule({ id: 'sustained', windowSeconds: 60 });

    expect(
      findRulesForSpender({
        rules: [burst, sustained],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([burst, sustained]);
  });

  it('keeps every window of the shared rules when the spender has its own rule', () => {
    const sharedBurst = buildRule({
      id: 'shared-burst',
      windowSeconds: 1,
      limitValue: 20,
    });
    const sharedSustained = buildRule({ id: 'shared-sustained' });
    const own = buildRule({
      id: 'own',
      spenderId: 'key-1',
      limitValue: 5000,
    });

    expect(
      findRulesForSpender({
        rules: [sharedBurst, sharedSustained, own],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([sharedBurst, sharedSustained, own]);
  });
});

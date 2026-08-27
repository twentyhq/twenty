import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
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

  const findRules = ({
    rules,
    limitKind = 'speed',
  }: {
    rules: FlatUsageLimit[];
    limitKind?: LimitKind;
  }) =>
    findRulesForSpender({
      rules,
      spender,
      operationType: UsageOperationType.API_REQUEST,
      limitKind,
    });

  it('charges a named spender against its own rule and the shared one', () => {
    const shared = buildRule({ id: 'shared', spenderId: '' });
    const own = buildRule({ id: 'own', spenderId: 'key-1', limitValue: 50 });

    expect(findRules({ rules: [shared, own] })).toEqual([shared, own]);
  });

  it('charges a spender with no rule of its own against the shared rule', () => {
    const shared = buildRule({ id: 'shared', spenderId: '' });

    expect(findRules({ rules: [shared] })).toEqual([shared]);
  });

  it('ignores a rule belonging to another spender', () => {
    const otherKey = buildRule({ id: 'other', spenderId: 'key-2' });

    expect(findRules({ rules: [otherKey] })).toEqual([]);
  });

  it('ignores a rule scoped to another spender type', () => {
    const application = buildRule({
      id: 'application',
      spenderType: 'application',
      spenderId: '',
    });

    expect(findRules({ rules: [application] })).toEqual([]);
  });

  it('ignores a rule scoped to a different operation', () => {
    const otherOperation = buildRule({
      spenderId: 'key-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });

    expect(findRules({ rules: [otherOperation] })).toEqual([]);
  });

  it('ignores a rule of another limit kind', () => {
    const quota = buildRule({
      id: 'quota',
      limitKind: 'quota',
      windowSeconds: 0,
    });

    expect(findRules({ rules: [quota] })).toEqual([]);
    expect(findRules({ rules: [quota], limitKind: 'quota' })).toEqual([quota]);
  });

  it('applies a wildcard-operation rule to every operation', () => {
    const wildcard = buildRule({ id: 'wildcard', operationType: '' });

    expect(findRules({ rules: [wildcard] })).toEqual([wildcard]);
  });

  it('applies a wildcard rule and an operation-specific rule together', () => {
    const wildcard = buildRule({ id: 'wildcard', operationType: '' });
    const specific = buildRule({
      id: 'specific',
      operationType: UsageOperationType.API_REQUEST,
    });

    expect(findRules({ rules: [wildcard, specific] })).toEqual([
      wildcard,
      specific,
    ]);
  });

  it('returns a burst and a sustained rule together', () => {
    const burst = buildRule({ id: 'burst', windowSeconds: 1, limitValue: 20 });
    const sustained = buildRule({ id: 'sustained', windowSeconds: 60 });

    expect(findRules({ rules: [burst, sustained] })).toEqual([
      burst,
      sustained,
    ]);
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

    expect(findRules({ rules: [sharedBurst, sharedSustained, own] })).toEqual([
      sharedBurst,
      sharedSustained,
      own,
    ]);
  });
});

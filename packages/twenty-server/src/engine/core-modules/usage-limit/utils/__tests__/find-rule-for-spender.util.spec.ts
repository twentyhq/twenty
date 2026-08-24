import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findRuleForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rule-for-spender.util';

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

describe('findRuleForSpender', () => {
  const spender = { spenderType: 'apiKey' as const, spenderId: 'key-1' };

  it('prefers a rule targeting the exact spender over one targeting every spender of that type', () => {
    const exact = buildRule({
      id: 'exact',
      spenderId: 'key-1',
      limitValue: 50,
    });
    const allOfType = buildRule({ id: 'all', spenderId: '' });

    expect(
      findRuleForSpender({
        rules: [allOfType, exact],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toBe(exact);
  });

  it('falls back to the rule targeting every spender of that type', () => {
    const allOfType = buildRule({ id: 'all', spenderId: '' });

    expect(
      findRuleForSpender({
        rules: [allOfType],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toBe(allOfType);
  });

  it('ignores a rule belonging to another spender', () => {
    const otherKey = buildRule({ id: 'other', spenderId: 'key-2' });

    expect(
      findRuleForSpender({
        rules: [otherKey],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toBeUndefined();
  });

  it('ignores a rule scoped to a different operation', () => {
    const otherOperation = buildRule({
      spenderId: 'key-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });

    expect(
      findRuleForSpender({
        rules: [otherOperation],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toBeUndefined();
  });
});

describe('findRuleForSpender for application rules', () => {
  const anyApp = buildRule({
    id: 'any-app',
    spenderType: 'application',
    spenderId: '',
    limitValue: 500,
  });

  const spender = {
    spenderType: 'application' as const,
    spenderId: 'application-install-1',
  };

  it('covers an app that has no rule of its own', () => {
    expect(
      findRuleForSpender({
        rules: [anyApp],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toBe(anyApp);
  });

  it('lets a rule naming one app raise it above the every-app rule', () => {
    const trustedApp = buildRule({
      id: 'trusted',
      spenderType: 'application',
      spenderId: 'application-install-1',
      limitValue: 2000,
    });

    const resolved = findRuleForSpender({
      rules: [anyApp, trustedApp],
      spender,
      operationType: UsageOperationType.API_REQUEST,
    });

    expect(resolved).toBe(trustedApp);
    expect(resolved?.limitValue).toBe(2000);
  });
});

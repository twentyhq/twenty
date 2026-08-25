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

  it('prefers a rule targeting the exact spender over one targeting every spender of that type', () => {
    const exact = buildRule({
      id: 'exact',
      spenderId: 'key-1',
      limitValue: 50,
    });
    const allOfType = buildRule({ id: 'all', spenderId: '' });

    expect(
      findRulesForSpender({
        rules: [allOfType, exact],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([exact]);
  });

  it('falls back to the rule targeting every spender of that type', () => {
    const allOfType = buildRule({ id: 'all', spenderId: '' });

    expect(
      findRulesForSpender({
        rules: [allOfType],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([allOfType]);
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
});

describe('findRulesForSpender for application rules', () => {
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
      findRulesForSpender({
        rules: [anyApp],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([anyApp]);
  });

  it('lets a rule naming one app raise it above the every-app rule', () => {
    const trustedApp = buildRule({
      id: 'trusted',
      spenderType: 'application',
      spenderId: 'application-install-1',
      limitValue: 2000,
    });

    const resolved = findRulesForSpender({
      rules: [anyApp, trustedApp],
      spender,
      operationType: UsageOperationType.API_REQUEST,
    });

    expect(resolved).toEqual([trustedApp]);
  });
});

describe('findRulesForSpender across windows', () => {
  const spender = { spenderType: 'apiKey' as const, spenderId: 'key-1' };

  it('returns a burst and a sustained rule together', () => {
    // Both have to become buckets: returning one silently leaves the other unenforced,
    // and the same spender carrying two windows is what the unique constraint allows.
    const burst = buildRule({
      id: 'burst',
      spenderId: 'key-1',
      windowSeconds: 1,
      limitValue: 20,
    });
    const sustained = buildRule({
      id: 'sustained',
      spenderId: 'key-1',
      windowSeconds: 60,
      limitValue: 100,
    });

    expect(
      findRulesForSpender({
        rules: [burst, sustained],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([burst, sustained]);
  });

  it('lets a rule naming the spender take over every window of the every-spender rules', () => {
    const everySpenderBurst = buildRule({
      id: 'every-burst',
      spenderId: '',
      windowSeconds: 1,
      limitValue: 20,
    });
    const everySpenderSustained = buildRule({
      id: 'every-sustained',
      spenderId: '',
      windowSeconds: 60,
      limitValue: 100,
    });
    const ownSustained = buildRule({
      id: 'own-sustained',
      spenderId: 'key-1',
      windowSeconds: 60,
      limitValue: 5000,
    });

    expect(
      findRulesForSpender({
        rules: [everySpenderBurst, everySpenderSustained, ownSustained],
        spender,
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([ownSustained]);
  });
});

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { resolveQuotaLimitValue } from 'src/engine/core-modules/usage-limit/utils/resolve-quota-limit-value.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'billingPeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000_000,
  burstValue: null,
  ...overrides,
});

describe('resolveQuotaLimitValue', () => {
  it('returns an absolute limit as is', () => {
    expect(
      resolveQuotaLimitValue({
        rule: buildRule({ limitValue: 5_000_000 }),
        allowanceMicro: null,
      }),
    ).toBe(5_000_000);
  });

  it('resolves a percent limit against the allowance in basis points', () => {
    expect(
      resolveQuotaLimitValue({
        rule: buildRule({ limitValueType: 'percent', limitValue: 9_900 }),
        allowanceMicro: 1_000_000,
      }),
    ).toBe(990_000);
  });

  it('returns null for a percent limit without an allowance', () => {
    expect(
      resolveQuotaLimitValue({
        rule: buildRule({ limitValueType: 'percent', limitValue: 9_900 }),
        allowanceMicro: null,
      }),
    ).toBeNull();
  });

  it('floors a percent resolution to a whole number', () => {
    expect(
      resolveQuotaLimitValue({
        rule: buildRule({ limitValueType: 'percent', limitValue: 3_333 }),
        allowanceMicro: 100,
      }),
    ).toBe(33);
  });
});

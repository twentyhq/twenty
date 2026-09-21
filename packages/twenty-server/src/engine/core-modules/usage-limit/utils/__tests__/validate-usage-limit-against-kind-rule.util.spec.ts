import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstKindRule } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-kind-rule.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const validSpeedLimit: CreateUsageLimitInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  meter: 'quantity',
  limitValue: 100,
};

const validQuotaLimit: CreateUsageLimitInput = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000_000,
};

const validStockLimit: CreateUsageLimitInput = {
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  meter: 'bytes',
  limitValue: 10_737_418_240,
};

const rejects = (input: CreateUsageLimitInput) =>
  expect(() => validateUsageLimitAgainstKindRule(input)).toThrow(
    expect.objectContaining({
      code: UsageLimitExceptionCode.LIMIT_INVALID,
    }),
  );

describe('validateUsageLimitAgainstKindRule', () => {
  describe('speed', () => {
    it('accepts a rolling window over several seconds', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule(validSpeedLimit),
      ).not.toThrow();
    });

    it('accepts a burst value', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validSpeedLimit,
          burstValue: 200,
        }),
      ).not.toThrow();
    });

    it('rejects a speed limit without a rolling window', () => {
      rejects({ ...validSpeedLimit, periodUnit: 'month' });
    });

    it('rejects a speed limit metered on credits', () => {
      rejects({ ...validSpeedLimit, meter: 'creditsUsedMicro' });
    });
  });

  describe('quota', () => {
    it('accepts a monthly credit quota', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule(validQuotaLimit),
      ).not.toThrow();
    });

    it('accepts a weekly quota', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validQuotaLimit,
          periodUnit: 'week',
        }),
      ).not.toThrow();
    });

    it('accepts a credit quota covering every operation', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validQuotaLimit,
          operationType: UsageOperationType.ALL,
        }),
      ).not.toThrow();
    });

    it('accepts a quantity quota on one operation', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validQuotaLimit,
          meter: 'quantity',
        }),
      ).not.toThrow();
    });

    it('rejects a quota on a rolling window', () => {
      rejects({ ...validQuotaLimit, periodUnit: 'second' });
    });

    it('rejects a quota that never resets', () => {
      rejects({ ...validQuotaLimit, periodUnit: 'lifetime' });
    });

    it('rejects a quota spanning several periods', () => {
      rejects({ ...validQuotaLimit, periodCount: 2 });
    });

    it('rejects a quota with a burst value', () => {
      rejects({ ...validQuotaLimit, burstValue: 200 });
    });

    it('rejects a quota metered on bytes', () => {
      rejects({ ...validQuotaLimit, meter: 'bytes' });
    });

    it('rejects a quantity quota covering every operation', () => {
      rejects({
        ...validQuotaLimit,
        operationType: UsageOperationType.ALL,
        meter: 'quantity',
      });
    });
  });

  describe('stock', () => {
    it('accepts a workspace-wide stock on the operation that fills it', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule(validStockLimit),
      ).not.toThrow();
    });

    it('accepts a stock metered on a file count', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validStockLimit,
          meter: 'quantity',
        }),
      ).not.toThrow();
    });

    it('accepts a stock capping one application', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validStockLimit,
          spenderType: 'application',
          spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        }),
      ).not.toThrow();
    });

    it('rejects a stock spanning every operation', () => {
      rejects({ ...validStockLimit, operationType: UsageOperationType.ALL });
    });

    it('rejects a stock that resets', () => {
      rejects({ ...validStockLimit, periodUnit: 'month' });
    });

    it('rejects a stock covering several periods', () => {
      rejects({ ...validStockLimit, periodCount: 3 });
    });

    it('rejects a stock holding a burst value', () => {
      rejects({ ...validStockLimit, burstValue: 10 });
    });

    it('rejects a stock metered on credits', () => {
      rejects({ ...validStockLimit, meter: 'creditsUsedMicro' });
    });

    it('rejects an application stock that names no application', () => {
      rejects({
        ...validStockLimit,
        spenderType: 'application',
        spenderId: null,
      });
    });
  });
});

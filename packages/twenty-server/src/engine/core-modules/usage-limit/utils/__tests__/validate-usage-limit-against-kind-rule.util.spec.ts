import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstKindRule } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-kind-rule.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const validSpeedLimit: CreateUsageLimitInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  unit: UsageUnit.REQUEST,
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
  unit: UsageUnit.CREDIT,
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
  unit: UsageUnit.BYTE,
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

    it('rejects a zero speed limit', () => {
      rejects({ ...validSpeedLimit, limitValue: 0 });
    });

    it('rejects a speed limit without a rolling window', () => {
      rejects({ ...validSpeedLimit, periodUnit: 'month' });
    });

    it('rejects a speed limit on every operation', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({
          ...validSpeedLimit,
          operationType: UsageOperationType.ALL,
        }),
      ).toThrow(
        expect.objectContaining({
          code: UsageLimitExceptionCode.LIMIT_INVALID,
          message: 'A speed limit targets a single operation, not ALL',
        }),
      );
    });
  });

  describe('quota', () => {
    it('accepts a monthly credit quota', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule(validQuotaLimit),
      ).not.toThrow();
    });

    it('accepts a zero quota that blocks the usage', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule({ ...validQuotaLimit, limitValue: 0 }),
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
  });

  describe('stock', () => {
    it('rejects a zero stock limit', () => {
      rejects({ ...validStockLimit, limitValue: 0 });
    });

    it('accepts a workspace-wide stock on the operation that fills it', () => {
      expect(() =>
        validateUsageLimitAgainstKindRule(validStockLimit),
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

    it('rejects an application stock that names no application', () => {
      rejects({
        ...validStockLimit,
        spenderType: 'application',
        spenderId: null,
      });
    });
  });
});

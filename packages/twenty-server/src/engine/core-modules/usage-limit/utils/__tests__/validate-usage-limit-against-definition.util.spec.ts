import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';

const validSpeedLimit: UpsertUsageLimitInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  meter: 'quantity',
  limitValueType: 'absolute',
  limitValue: 100,
};

const validQuotaLimit: UpsertUsageLimitInput = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000_000,
};

describe('validateUsageLimitAgainstDefinition', () => {
  it('accepts a limit the definition allows', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition(validSpeedLimit),
    ).not.toThrow();
  });

  it('rejects a resource that has no definition', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        resourceType: UsageResourceType.STORAGE,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects an operation the resource does not meter', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        operationType: UsageOperationType.EMAIL_SEND,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('refuses to rate-limit a human, because the definition does not allow that scope', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        spenderType: 'userWorkspace',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a speed limit without a rolling window', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        periodUnit: 'month',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a speed limit metered on credits', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        meter: 'creditsUsedMicro',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a workspace limit, because the definition does not allow that scope', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        spenderType: 'workspace',
        spenderId: null,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a spender id that is not a uuid', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        spenderId: 'key-1',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('accepts a limit targeting every spender of a type', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        spenderId: null,
      }),
    ).not.toThrow();
  });

  it('accepts a monthly credit quota on the workspace', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition(validQuotaLimit),
    ).not.toThrow();
  });

  it('accepts a quota scoped to one agent', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        spenderType: 'agent',
        spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      }),
    ).not.toThrow();
  });

  it('accepts a quota covering every operation of the resource', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        operationType: UsageOperationType.ALL,
      }),
    ).not.toThrow();
  });

  it('rejects a quota on a rolling window', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'second',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a quota with a burst value', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        burstValue: 200,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('accepts a quota over the allowance period', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'allowancePeriod',
      }),
    ).not.toThrow();
  });

  it('accepts a credit quota as a percent of the allowance', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'allowancePeriod',
        limitValueType: 'allowancePercent',
        limitValue: 40,
      }),
    ).not.toThrow();
  });

  it('rejects a percent of the allowance over a calendar period', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        limitValueType: 'allowancePercent',
        limitValue: 40,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a percent of the allowance metered on quantity', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'allowancePeriod',
        meter: 'quantity',
        limitValueType: 'allowancePercent',
        limitValue: 40,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a percent of the allowance above 100', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'allowancePeriod',
        limitValueType: 'allowancePercent',
        limitValue: 101,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a speed limit expressed as a percent of the allowance', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        limitValueType: 'allowancePercent',
        limitValue: 40,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('accepts an absolute weekly quota', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'week',
        limitValue: 5_000_000,
      }),
    ).not.toThrow();
  });

  it('rejects a quota spanning several periods', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'week',
        periodCount: 2,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('accepts a token quota on one operation', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        meter: 'quantity',
        limitValue: 1_000_000,
      }),
    ).not.toThrow();
  });

  it('rejects a quantity quota covering every operation', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        operationType: UsageOperationType.ALL,
        meter: 'quantity',
        limitValue: 1_000_000,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a quota on a spender type the resource does not allow', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        spenderType: 'workflow',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });
});

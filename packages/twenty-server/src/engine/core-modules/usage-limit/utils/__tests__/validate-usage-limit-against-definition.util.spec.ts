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
  meter: 'creditsUsedMicro',
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
  periodUnit: 'billingPeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'percent',
  limitValue: 9900,
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
        periodUnit: 'billingPeriod',
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

  it('accepts a percent quota on the workspace', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition(validQuotaLimit),
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
        periodCount: 60,
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

  it('rejects a percent speed limit', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        limitValueType: 'percent',
        limitValue: 5000,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a percent value outside basis points', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        limitValue: 10001,
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
        limitValueType: 'absolute',
        limitValue: 5_000_000,
      }),
    ).not.toThrow();
  });

  it('rejects a percent quota outside the billing period', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'week',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_INVALID,
      }),
    );
  });

  it('rejects a quota spanning several periods', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        periodUnit: 'week',
        limitValueType: 'absolute',
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
        limitValueType: 'absolute',
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
        limitValueType: 'absolute',
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

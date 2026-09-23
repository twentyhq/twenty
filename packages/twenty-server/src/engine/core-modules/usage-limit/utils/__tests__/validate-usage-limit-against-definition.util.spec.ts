import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';
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
  expect(() => validateUsageLimitAgainstDefinition(input)).toThrow(
    expect.objectContaining({
      code: UsageLimitExceptionCode.LIMIT_INVALID,
    }),
  );

describe('validateUsageLimitAgainstDefinition', () => {
  it('accepts a limit the definition allows', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition(validSpeedLimit),
    ).not.toThrow();
  });

  it('accepts a limit targeting every spender of a type', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedLimit,
        spenderId: null,
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

  it('accepts a quota scoped to one application', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validQuotaLimit,
        spenderType: 'application',
        spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      }),
    ).not.toThrow();
  });

  it('rejects a resource that has no definition', () => {
    rejects({ ...validSpeedLimit, resourceType: UsageResourceType.WORKFLOW });
  });

  it('rejects an operation the resource does not meter', () => {
    rejects({
      ...validSpeedLimit,
      operationType: UsageOperationType.EMAIL_SEND,
    });
  });

  it('refuses to rate-limit a human, because the definition does not allow that scope', () => {
    rejects({ ...validSpeedLimit, spenderType: 'userWorkspace' });
  });

  it('rejects a workspace limit, because the definition does not allow that scope', () => {
    rejects({ ...validSpeedLimit, spenderType: 'workspace', spenderId: null });
  });

  it('rejects a spender id that is not a uuid', () => {
    rejects({ ...validSpeedLimit, spenderId: 'key-1' });
  });

  it('rejects a quota scoped to an agent, which spends through its workflow', () => {
    rejects({
      ...validQuotaLimit,
      spenderType: 'agent',
      spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    });
  });

  it('rejects a quota on a spender type the resource does not allow', () => {
    rejects({ ...validQuotaLimit, spenderType: 'workflow' });
  });

  it('rejects a quota metered on bytes, which the resource does not track', () => {
    rejects({ ...validQuotaLimit, meter: 'bytes' });
  });

  it('rejects a stock scoped below the workspace', () => {
    rejects({
      ...validStockLimit,
      spenderType: 'userWorkspace',
      spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    });
  });

  it('rejects a stock metered on credits, which the resource does not track', () => {
    rejects({ ...validStockLimit, meter: 'creditsUsedMicro' });
  });
});

import { isDefined } from 'twenty-shared/utils';

import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';
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

const validCodeExecutionQuotaLimit: CreateUsageLimitInput = {
  ...validQuotaLimit,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
};

const rejects = (input: CreateUsageLimitInput, message?: string) =>
  expect(() => validateUsageLimitAgainstDefinition(input)).toThrow(
    expect.objectContaining({
      code: UsageLimitExceptionCode.LIMIT_INVALID,
      ...(isDefined(message) ? { message } : {}),
    }),
  );

const accepts = (input: CreateUsageLimitInput) =>
  expect(() => validateUsageLimitAgainstDefinition(input)).not.toThrow();

describe('validateUsageLimitAgainstDefinition', () => {
  it('accepts a limit the definition allows', () => {
    accepts(validSpeedLimit);
  });

  it('accepts a limit targeting every spender of a type', () => {
    accepts({ ...validSpeedLimit, spenderId: null });
  });

  it('accepts a credit quota covering every operation of the resource', () => {
    accepts({ ...validQuotaLimit, operationType: UsageOperationType.ALL });
  });

  it('accepts a quota scoped to one application', () => {
    accepts({
      ...validQuotaLimit,
      spenderType: 'application',
      spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    });
  });

  it.each([UsageUnit.CREDIT, UsageUnit.INVOCATION, UsageUnit.MILLISECOND])(
    'accepts a code execution quota counted in %s',
    (unit) => {
      accepts({ ...validCodeExecutionQuotaLimit, unit });
    },
  );

  it('accepts a webhook speed limit counted in requests', () => {
    accepts({
      ...validSpeedLimit,
      resourceType: UsageResourceType.WEBHOOK,
      operationType: UsageOperationType.WEBHOOK_CALL,
      spenderType: 'workspace',
      spenderId: null,
    });
  });

  it('leaves a speed limit on every operation to the kind rule', () => {
    accepts({ ...validSpeedLimit, operationType: UsageOperationType.ALL });
  });

  it('rejects a resource that has no definition', () => {
    rejects({ ...validSpeedLimit, resourceType: UsageResourceType.WORKFLOW });
  });

  it('rejects an operation the resource does not limit', () => {
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

  it('rejects a runtime quota on email sends, naming the units it allows', () => {
    rejects(
      {
        ...validQuotaLimit,
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        unit: UsageUnit.MILLISECOND,
      },
      'EMAIL EMAIL_SEND quota limits cannot count MILLISECOND, only CREDIT, INVOCATION',
    );
  });

  it('rejects a token quota on web searches, which record invocations', () => {
    rejects({
      ...validQuotaLimit,
      operationType: UsageOperationType.WEB_SEARCH,
      unit: UsageUnit.TOKEN,
    });
  });

  it('rejects a quota counted in bytes, which the resource does not track', () => {
    rejects({ ...validQuotaLimit, unit: UsageUnit.BYTE });
  });

  it('rejects an api speed limit counted in complexity, which it does not debit', () => {
    rejects({ ...validSpeedLimit, unit: UsageUnit.COMPLEXITY });
  });

  it('rejects a quota on every operation counted in anything but credits', () => {
    rejects(
      {
        ...validQuotaLimit,
        operationType: UsageOperationType.ALL,
        unit: UsageUnit.INVOCATION,
      },
      'A INVOCATION quota needs an operation: only credits aggregate across operations',
    );
  });

  it('rejects a stock scoped below the workspace', () => {
    rejects({
      ...validStockLimit,
      spenderType: 'userWorkspace',
      spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    });
  });

  it('accepts a storage stock counted in files', () => {
    accepts({ ...validStockLimit, unit: UsageUnit.FILE });
  });

  it('rejects a storage stock counted in credits', () => {
    rejects({ ...validStockLimit, unit: UsageUnit.CREDIT });
  });
});

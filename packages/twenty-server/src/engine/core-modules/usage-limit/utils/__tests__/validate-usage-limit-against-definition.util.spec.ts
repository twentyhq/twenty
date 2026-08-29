import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';

const validSpeedRule: UpsertUsageLimitInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  limitKind: 'speed',
  windowSeconds: 60,
  limitValue: 100,
};

describe('validateUsageLimitAgainstDefinition', () => {
  it('accepts a rule the definition allows', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition(validSpeedRule),
    ).not.toThrow();
  });

  it('rejects a resource that has no definition', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        resourceType: UsageResourceType.STORAGE,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('rejects an operation the resource does not meter', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        operationType: UsageOperationType.EMAIL_SEND,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('refuses to rate-limit a human, because the definition does not allow that scope', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        spenderType: 'userWorkspace',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('rejects a speed rule with no window', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        windowSeconds: 0,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('rejects a workspace rule, because the definition does not allow that scope', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        spenderType: 'workspace',
        spenderId: null,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('rejects a spender id that is not a uuid', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        spenderId: 'key-1',
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      }),
    );
  });

  it('accepts a rule targeting every spender of a type', () => {
    expect(() =>
      validateUsageLimitAgainstDefinition({
        ...validSpeedRule,
        spenderId: null,
      }),
    ).not.toThrow();
  });
});

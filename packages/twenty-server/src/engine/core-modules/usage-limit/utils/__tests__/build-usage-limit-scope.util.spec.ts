import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildInput = (
  overrides: Partial<CreateUsageLimitInput> = {},
): CreateUsageLimitInput => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000_000,
  burstValue: null,
  ...overrides,
});

describe('buildUsageLimitScope', () => {
  it('keeps the columns the unique index covers, and drops the values', () => {
    expect(buildUsageLimitScope(buildInput())).toEqual({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      spenderId: '',
      limitKind: 'quota',
      periodCount: 1,
      periodUnit: 'month',
      meter: 'creditsUsedMicro',
    });
  });

  it('stores an absent spender id as the empty string the index matches on', () => {
    expect(buildUsageLimitScope(buildInput()).spenderId).toBe('');
    expect(
      buildUsageLimitScope(buildInput({ spenderId: 'user-1' })).spenderId,
    ).toBe('user-1');
  });
});

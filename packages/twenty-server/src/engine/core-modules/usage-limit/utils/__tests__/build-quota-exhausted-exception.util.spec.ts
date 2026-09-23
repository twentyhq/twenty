import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { buildQuotaExhaustedException } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-exception.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildExhaustedScope = (
  overrides: Partial<ExhaustedScope> = {},
): ExhaustedScope => ({
  resourceType: UsageResourceType.EMAIL,
  limitKind: 'quota',
  exhaustedKind: 'limit',
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
  operationType: UsageOperationType.EMAIL_SEND,
  limitValue: 1000,
  remaining: 0,
  periodCount: 1,
  periodUnit: 'month',
  retryAfterMs: 0,
  ...overrides,
});

describe('buildQuotaExhaustedException', () => {
  it('names the spender type when a configured limit is exhausted', () => {
    const exception = buildQuotaExhaustedException(buildExhaustedScope());

    expect(exception.message).toBe('Usage limit reached for userWorkspace');
    expect(exception.code).toBe(UsageLimitExceptionCode.QUOTA_EXHAUSTED);
  });

  it('overrides the generic user friendly message when the credit allowance is exhausted', () => {
    const allowanceException = buildQuotaExhaustedException(
      buildExhaustedScope({ exhaustedKind: 'allowance' }),
    );

    expect(allowanceException.message).toBe(
      'Credit allowance exhausted for this billing period',
    );
    expect(allowanceException.userFriendlyMessage).not.toEqual(
      buildQuotaExhaustedException(buildExhaustedScope()).userFriendlyMessage,
    );
  });

  it('carries the exhausted scope so the api filters can build a response', () => {
    const exhaustedScope = buildExhaustedScope();

    expect(buildQuotaExhaustedException(exhaustedScope).exhaustedScope).toBe(
      exhaustedScope,
    );
  });
});

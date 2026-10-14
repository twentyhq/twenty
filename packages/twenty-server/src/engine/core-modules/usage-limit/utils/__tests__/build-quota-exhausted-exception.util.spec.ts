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
    const workspaceAllowanceException = buildQuotaExhaustedException(
      buildExhaustedScope({ exhaustedKind: 'workspaceAllowance' }),
    );

    expect(workspaceAllowanceException.message).toBe(
      'Credit allowance exhausted for this billing period',
    );
    expect(workspaceAllowanceException.userFriendlyMessage).not.toEqual(
      buildQuotaExhaustedException(buildExhaustedScope()).userFriendlyMessage,
    );
  });

  it('tells the member their own AI credits are used up when the user allowance is exhausted', () => {
    const userAllowanceException = buildQuotaExhaustedException(
      buildExhaustedScope({
        resourceType: UsageResourceType.AI,
        exhaustedKind: 'userAllowance',
        operationType: UsageOperationType.ALL,
        periodCount: null,
        periodUnit: null,
      }),
    );

    expect(userAllowanceException.message).toBe(
      'User credits allowance exhausted for this period',
    );
    expect(userAllowanceException.code).toBe(
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
    );
    expect(userAllowanceException.userFriendlyMessage.message).toBe(
      'Your AI credits for this period are used up.',
    );
  });

  it('carries the exhausted scope so the api filters can build a response', () => {
    const exhaustedScope = buildExhaustedScope();

    expect(buildQuotaExhaustedException(exhaustedScope).exhaustedScope).toBe(
      exhaustedScope,
    );
  });
});

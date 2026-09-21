import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { usageLimitToGraphqlApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-graphql-api-exception-handler.util';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

const buildExhaustedScope = (
  overrides: Partial<ExhaustedScope> = {},
): ExhaustedScope => ({
  resourceType: UsageResourceType.API,
  limitKind: 'speed',
  exhaustedKind: 'limit',
  spenderType: 'apiKey',
  spenderId: 'key-1',
  operationType: UsageOperationType.API_REQUEST,
  limitValue: 3,
  remaining: 0,
  periodCount: 60,
  periodUnit: 'second',
  retryAfterMs: 11983,
  isDefault: true,
  ...overrides,
});

const catchThrown = (exhaustedScope?: ExhaustedScope): BaseGraphQLError => {
  try {
    usageLimitToGraphqlApiExceptionHandler(
      new UsageLimitException(
        'Rate limit exceeded for apiKey: 3 requests per 60s.',
        UsageLimitExceptionCode.RATE_LIMITED,
        { exhaustedScope },
      ),
    );
  } catch (error) {
    return error as BaseGraphQLError;
  }

  throw new Error('the handler was expected to throw');
};

describe('usageLimitToGraphqlApiExceptionHandler', () => {
  it('raises a BaseGraphQLError so the code survives error normalisation', () => {
    const error = catchThrown(buildExhaustedScope());

    expect(error).toBeInstanceOf(BaseGraphQLError);
    expect(error.extensions.code).toBe(ErrorCode.RATE_LIMITED);
  });

  it('keeps transport concerns out of the GraphQL error', () => {
    expect(catchThrown(buildExhaustedScope()).extensions.http).toBeUndefined();
  });

  it('reports the exhausted scope back to the caller', () => {
    const error = catchThrown(buildExhaustedScope());

    expect(error.extensions).toMatchObject({
      limitKind: 'speed',
      exhaustedKind: 'limit',
      limit: 3,
      remaining: 0,
      periodCount: 60,
      periodUnit: 'second',
      retryAfterMs: 11983,
      scope: { spenderType: 'apiKey', spenderId: 'key-1' },
    });
  });

  it('keeps a denial out of Sentry', () => {
    expect(shouldCaptureException(catchThrown(buildExhaustedScope()))).toBe(
      false,
    );
  });

  it('still names the code when no scope was resolved', () => {
    expect(catchThrown(undefined).extensions.code).toBe(ErrorCode.RATE_LIMITED);
  });

  it('names an exhausted quota apart from an exhausted rate', () => {
    try {
      usageLimitToGraphqlApiExceptionHandler(
        new UsageLimitException(
          'Usage quota exhausted.',
          UsageLimitExceptionCode.QUOTA_EXHAUSTED,
          { exhaustedScope: buildExhaustedScope() },
        ),
      );
    } catch (error) {
      expect((error as BaseGraphQLError).extensions.code).toBe(
        ErrorCode.QUOTA_EXHAUSTED,
      );
    }
  });
});

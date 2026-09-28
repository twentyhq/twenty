import { getGraphqlOperationMetricKeyFromErrorCode } from 'src/engine/core-modules/graphql/utils/get-graphql-operation-metric-key-from-error-code.util';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

describe('getGraphqlOperationMetricKeyFromErrorCode', () => {
  it('should map codes with a dedicated status metric', () => {
    expect(
      getGraphqlOperationMetricKeyFromErrorCode(ErrorCode.UNAUTHENTICATED),
    ).toBe(MetricsKeys.GraphqlOperation401);
    expect(getGraphqlOperationMetricKeyFromErrorCode(ErrorCode.FORBIDDEN)).toBe(
      MetricsKeys.GraphqlOperation403,
    );
    expect(getGraphqlOperationMetricKeyFromErrorCode(ErrorCode.NOT_FOUND)).toBe(
      MetricsKeys.GraphqlOperation404,
    );
    expect(
      getGraphqlOperationMetricKeyFromErrorCode(
        ErrorCode.INTERNAL_SERVER_ERROR,
      ),
    ).toBe(MetricsKeys.GraphqlOperation500);
  });

  it('should map other client error codes to 400', () => {
    expect(
      getGraphqlOperationMetricKeyFromErrorCode(ErrorCode.BAD_USER_INPUT),
    ).toBe(MetricsKeys.GraphqlOperation400);
    expect(
      getGraphqlOperationMetricKeyFromErrorCode(ErrorCode.RATE_LIMITED),
    ).toBe(MetricsKeys.GraphqlOperation400);
  });

  it('should return undefined for unknown codes', () => {
    expect(getGraphqlOperationMetricKeyFromErrorCode('SOMETHING_ELSE')).toBe(
      undefined,
    );
    expect(getGraphqlOperationMetricKeyFromErrorCode(undefined)).toBe(
      undefined,
    );
  });
});

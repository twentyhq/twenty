import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { graphQLErrorCodesToFilter } from 'src/engine/utils/global-exception-handler.util';

const METRIC_KEY_BY_ERROR_CODE: Partial<Record<ErrorCode, MetricsKeys>> = {
  [ErrorCode.UNAUTHENTICATED]: MetricsKeys.GraphqlOperation401,
  [ErrorCode.FORBIDDEN]: MetricsKeys.GraphqlOperation403,
  [ErrorCode.NOT_FOUND]: MetricsKeys.GraphqlOperation404,
  [ErrorCode.INTERNAL_SERVER_ERROR]: MetricsKeys.GraphqlOperation500,
};

export const getGraphqlOperationMetricKeyFromErrorCode = (
  code: unknown,
): MetricsKeys | undefined => {
  const metricKey = METRIC_KEY_BY_ERROR_CODE[code as ErrorCode];

  if (!metricKey && graphQLErrorCodesToFilter.includes(code as ErrorCode)) {
    return MetricsKeys.GraphqlOperation400;
  }

  return metricKey;
};

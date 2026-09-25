import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { graphQLErrorCodesToFilter } from 'src/engine/utils/global-exception-handler.util';

const ERROR_CODES = new Set<string>(Object.values(ErrorCode));

const METRIC_KEY_BY_ERROR_CODE: Partial<Record<ErrorCode, MetricsKeys>> = {
  [ErrorCode.UNAUTHENTICATED]: MetricsKeys.GraphqlOperation401,
  [ErrorCode.FORBIDDEN]: MetricsKeys.GraphqlOperation403,
  [ErrorCode.NOT_FOUND]: MetricsKeys.GraphqlOperation404,
  [ErrorCode.INTERNAL_SERVER_ERROR]: MetricsKeys.GraphqlOperation500,
};

const isErrorCode = (code: unknown): code is ErrorCode =>
  isString(code) && ERROR_CODES.has(code);

export const getGraphqlOperationMetricKeyFromErrorCode = (
  code: unknown,
): MetricsKeys | undefined => {
  if (!isErrorCode(code)) {
    return undefined;
  }

  const metricKey = METRIC_KEY_BY_ERROR_CODE[code];

  if (!isDefined(metricKey) && graphQLErrorCodesToFilter.includes(code)) {
    return MetricsKeys.GraphqlOperation400;
  }

  return metricKey;
};

import { msg } from '@lingui/core/macro';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

const ARRAY_OPERATORS = ['in', 'contains', 'notContains', 'containsExactly'];

export const assertArrayOperatorValueIsNonEmptyArray = ({
  operator,
  value,
  key,
}: {
  operator: string;
  value: unknown;
  key: string;
}): void => {
  if (
    ARRAY_OPERATORS.includes(operator) &&
    (!Array.isArray(value) || value.length === 0)
  ) {
    throw new GraphqlQueryRunnerException(
      `Invalid filter value for field ${key}. Expected non-empty array`,
      GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: msg`Invalid filter value` },
    );
  }
};

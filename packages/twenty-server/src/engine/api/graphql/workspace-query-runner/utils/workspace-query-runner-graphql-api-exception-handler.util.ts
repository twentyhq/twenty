import { type QueryFailedError } from 'typeorm';

import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { usageLimitToGraphqlApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-graphql-api-exception-handler.util';
import { RecordValidationRuleException } from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';
import { recordValidationRuleGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/validation-rule/utils/record-validation-rule-graphql-api-exception-handler.util';

export interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

// Other errors are rethrown as is; the GraphQL error hook converts CustomExceptions by category
export const workspaceQueryRunnerGraphqlApiExceptionHandler = (
  error: Error | QueryFailedError,
) => {
  switch (true) {
    case error instanceof UsageLimitException:
      return usageLimitToGraphqlApiExceptionHandler(error);
    case error instanceof RecordValidationRuleException:
      return recordValidationRuleGraphqlApiExceptionHandler(error);
    default:
      throw error;
  }
};

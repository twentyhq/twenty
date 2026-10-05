import { BadRequestException } from '@nestjs/common';

import { type QueryFailedError } from 'typeorm';

import { CommonSelectFieldsException } from 'src/engine/api/common/common-select-fields/common-select-fields.exception';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { usageLimitToRestApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-rest-api-exception-handler.util';
import { RecordValidationRuleHttpException } from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule-http.exception';
import { RecordValidationRuleException } from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

export const workspaceQueryRunnerRestApiExceptionHandler = (
  error: QueryFailedErrorWithCode,
): never => {
  switch (true) {
    case error instanceof CommonSelectFieldsException:
      throw new BadRequestException(
        `'fields' parameter invalid. ${error.message}`,
      );
    case error instanceof UsageLimitException:
      return usageLimitToRestApiExceptionHandler(error);
    case error instanceof RecordValidationRuleException:
      throw new RecordValidationRuleHttpException(error);
    default:
      throw error;
  }
};

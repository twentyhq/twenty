import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const handleWorkflowQueryValidationException = (
  exception: WorkflowQueryValidationException,
) => {
  switch (exception.code) {
    case WorkflowQueryValidationExceptionCode.FORBIDDEN:
      throw new ForbiddenError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};

@Catch(WorkflowQueryValidationException)
export class WorkflowQueryValidationGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkflowQueryValidationException) {
    handleWorkflowQueryValidationException(exception);
  }
}

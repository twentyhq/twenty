import { Catch, type ExceptionFilter } from '@nestjs/common';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkflowVersionValidationException } from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';

@Catch(WorkflowVersionValidationException)
export class WorkflowVersionValidationGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkflowVersionValidationException) {
    throw new UserInputError(exception);
  }
}

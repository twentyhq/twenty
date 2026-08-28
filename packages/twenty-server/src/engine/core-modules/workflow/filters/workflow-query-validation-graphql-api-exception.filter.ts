import { Catch, type ExceptionFilter } from '@nestjs/common';

import { WorkflowQueryValidationException } from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { workflowQueryValidationGraphqlApiExceptionHandler } from 'src/modules/workflow/common/utils/workflow-query-validation-graphql-api-exception-handler.util';

@Catch(WorkflowQueryValidationException)
export class WorkflowQueryValidationGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkflowQueryValidationException) {
    workflowQueryValidationGraphqlApiExceptionHandler(exception);
  }
}

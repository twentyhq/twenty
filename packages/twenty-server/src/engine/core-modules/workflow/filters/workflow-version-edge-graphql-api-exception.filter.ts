import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';

export const handleWorkflowVersionEdgeException = (
  exception: WorkflowVersionEdgeException,
) => {
  switch (exception.code) {
    case WorkflowVersionEdgeExceptionCode.NOT_FOUND:
      throw new NotFoundError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};

@Catch(WorkflowVersionEdgeException)
export class WorkflowVersionEdgeGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkflowVersionEdgeException) {
    handleWorkflowVersionEdgeException(exception);
  }
}

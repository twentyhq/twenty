import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { isValidUuid } from 'twenty-shared/utils';

export const assertIsValidUuid = (value: string) => {
  if (!isValidUuid(value)) {
    throw new WorkspaceQueryRunnerException(
      `Value "${value}" is not a valid UUID`,
      WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    );
  }
};

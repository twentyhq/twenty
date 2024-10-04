import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

export const assertIsValidUuid = (value: string) => {
  const isValid =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
      value,
    );

  if (!isValid) {
    throw new WorkspaceQueryRunnerException(
      `Value "${value}" is not a valid UUID`,
      WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    );
  }
};

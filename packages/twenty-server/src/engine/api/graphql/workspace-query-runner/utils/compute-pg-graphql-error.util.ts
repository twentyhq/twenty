import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

export type PgGraphQLConfig = {
  atMost: number;
};

interface PgGraphQLErrorMapping {
  [key: string]: (
    command: string,
    objectName: string,
    pgGraphqlConfig: PgGraphQLConfig,
  ) => WorkspaceQueryRunnerException;
}

const pgGraphQLCommandMapping = {
  insertInto: 'insert',
  update: 'update',
  deleteFrom: 'delete',
};

const pgGraphQLErrorMapping: PgGraphQLErrorMapping = {
  'delete impacts too many records': (_, objectName, pgGraphqlConfig) =>
    new WorkspaceQueryRunnerException(
      `Cannot delete ${objectName} because it impacts too many records (more than ${pgGraphqlConfig?.atMost}).`,
      WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED,
    ),
  'update impacts too many records': (_, objectName, pgGraphqlConfig) =>
    new WorkspaceQueryRunnerException(
      `Cannot update ${objectName} because it impacts too many records (more than ${pgGraphqlConfig?.atMost}).`,
      WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED,
    ),
  'duplicate key value violates unique constraint': (command, objectName, _) =>
    new WorkspaceQueryRunnerException(
      `Cannot ${
        // @ts-expect-error legacy noImplicitAny
        pgGraphQLCommandMapping[command] ?? command
      } ${objectName} because it violates a uniqueness constraint.`,
      WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_UNIQUE_CONSTRAINT,
    ),
  'violates foreign key constraint': (command, objectName, _) =>
    new WorkspaceQueryRunnerException(
      `Cannot ${
        // @ts-expect-error legacy noImplicitAny
        pgGraphQLCommandMapping[command] ?? command
      } ${objectName} because it violates a foreign key constraint.`,
      WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT,
    ),
};

export const computePgGraphQLError = (
  command: string,
  objectName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[],
  pgGraphqlConfig: PgGraphQLConfig,
) => {
  const error = errors[0];
  const errorMessage = error?.message;

  const mappedErrorKey = Object.keys(pgGraphQLErrorMapping).find((key) =>
    errorMessage?.includes(key),
  );

  const mappedError = mappedErrorKey
    ? pgGraphQLErrorMapping[mappedErrorKey]
    : null;

  if (mappedError) {
    return mappedError(command, objectName, pgGraphqlConfig);
  }

  return new WorkspaceQueryRunnerException(
    `GraphQL errors on ${command}${objectName}: ${JSON.stringify(error)}`,
    WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
  );
};

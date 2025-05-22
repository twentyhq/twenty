import { QueryFailedError } from 'typeorm';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { graphqlQueryRunnerExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/graphql-query-runner-exception-handler.util';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { workspaceExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-exception-handler.util';
import { WorkspaceQueryRunnerException } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permission-graphql-api-exception-handler.util';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

export const workspaceQueryRunnerGraphqlApiExceptionHandler = (
  error: QueryFailedErrorWithCode,
  context: WorkspaceQueryRunnerOptions,
) => {
  switch (true) {
    case error instanceof QueryFailedError: {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        return handleDuplicateKeyError(error, context);
      }
      const errorCode = (error as QueryFailedErrorWithCode).code;

      if (POSTGRESQL_ERROR_CODES.includes(errorCode)) {
        throw new PostgresException(error.message, errorCode);
      }
      throw error;
    }
    case error instanceof PermissionsException:
      return permissionGraphqlApiExceptionHandler(error);
    case error instanceof WorkspaceQueryRunnerException:
      return workspaceExceptionHandler(error);
    case error instanceof GraphqlQueryRunnerException:
      return graphqlQueryRunnerExceptionHandler(error);
    default:
      throw error;
  }
};

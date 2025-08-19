import { type QueryFailedError } from 'typeorm';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { graphqlQueryRunnerExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/graphql-query-runner-exception-handler.util';
import { workspaceExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-exception-handler.util';
import { WorkspaceQueryRunnerException } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { ApiKeyException } from 'src/engine/core-modules/api-key/api-key.exception';
import { apiKeyGraphqlApiExceptionHandler } from 'src/engine/core-modules/api-key/utils/api-key-graphql-api-exception-handler.util';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { authGraphqlApiExceptionHandler } from 'src/engine/core-modules/auth/utils/auth-graphql-api-exception-handler.util';
import { RecordTransformerException } from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import { recordTransformerGraphqlApiExceptionHandler } from 'src/engine/core-modules/record-transformer/utils/record-transformer-graphql-api-exception-handler.util';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permission-graphql-api-exception-handler.util';
import { TwentyORMException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { twentyORMGraphqlApiExceptionHandler } from 'src/engine/twenty-orm/utils/twenty-orm-graphql-api-exception-handler.util';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

export const workspaceQueryRunnerGraphqlApiExceptionHandler = (
  error: QueryFailedErrorWithCode,
) => {
  switch (true) {
    case error instanceof RecordTransformerException:
      return recordTransformerGraphqlApiExceptionHandler(error);
    case error instanceof PermissionsException:
      return permissionGraphqlApiExceptionHandler(error);
    case error instanceof WorkspaceQueryRunnerException:
      return workspaceExceptionHandler(error);
    case error instanceof GraphqlQueryRunnerException:
      return graphqlQueryRunnerExceptionHandler(error);
    case error instanceof TwentyORMException:
      return twentyORMGraphqlApiExceptionHandler(error);
    case error instanceof AuthException:
      return authGraphqlApiExceptionHandler(error);
    case error instanceof ApiKeyException:
      return apiKeyGraphqlApiExceptionHandler(error);
    default:
      throw error;
  }
};

import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

export const createQueryRunnerContext = ({
  workspaceSchemaBuilderContext,
}: {
  workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext;
}): CommonBaseQueryRunnerContext => {
  return {
    ...workspaceSchemaBuilderContext,
    authContext: getWorkspaceAuthContext(),
  };
};

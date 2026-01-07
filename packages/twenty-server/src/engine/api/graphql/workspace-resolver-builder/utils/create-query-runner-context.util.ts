import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export const createQueryRunnerContext = ({
  workspaceSchemaBuilderContext,
  request,
}: {
  workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext;
  request: AuthContext;
}): CommonBaseQueryRunnerContext => {
  const {
    user,
    workspace,
    apiKey,
    workspaceMemberId,
    userWorkspaceId,
    userWorkspace,
    authProvider,
    impersonationContext,
    workspaceMember,
    application,
  } = request;

  return {
    ...workspaceSchemaBuilderContext,
    authContext: {
      user,
      workspace,
      apiKey,
      workspaceMemberId,
      userWorkspaceId,
      userWorkspace,
      authProvider,
      impersonationContext,
      workspaceMember,
      application,
    },
  };
};

import type { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export const computeResolverContext = ({
  workspaceSchemaBuilderContext,
  request,
}: {
  workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext;
  request: AuthContext;
}): WorkspaceSchemaBuilderContext => {
  const {
    user,
    workspace,
    apiKey,
    application,
    workspaceMemberId,
    userWorkspaceId,
    userWorkspace,
    authProvider,
    impersonationContext,
  } = request;

  return {
    ...workspaceSchemaBuilderContext,
    authContext: {
      user,
      workspace,
      apiKey,
      application,
      workspaceMemberId,
      userWorkspaceId,
      userWorkspace,
      authProvider,
      impersonationContext,
    },
  };
};

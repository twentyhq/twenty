import { isDefined } from 'twenty-shared/utils';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolAuthContextDependencies } from 'src/engine/core-modules/tool-provider/types/tool-auth-context-dependencies.type';
import { buildRequiredToolAuthContext } from 'src/engine/core-modules/tool-provider/utils/build-required-tool-auth-context.util';

const resolveToolAuthContext = async ({
  context,
  userRepository,
  workspaceCacheService,
}: { context: ToolProviderContext } & ToolAuthContextDependencies): Promise<
  WorkspaceAuthContext | undefined
> => {
  if (isDefined(context.authContext)) {
    return context.authContext;
  }

  if (!isDefined(context.userId) || !isDefined(context.userWorkspaceId)) {
    return undefined;
  }

  return buildRequiredToolAuthContext({
    context,
    userRepository,
    workspaceCacheService,
  });
};

// Queue workers get no async-local auth context from WorkspaceAuthContextMiddleware, so establish one around the dispatch.
export const withResolvedToolAuthContext = async <T>(
  {
    context,
    userRepository,
    workspaceCacheService,
  }: { context: ToolProviderContext } & ToolAuthContextDependencies,
  dispatch: (contextWithAuth: ToolProviderContext) => Promise<T>,
): Promise<T> => {
  const authContext = await resolveToolAuthContext({
    context,
    userRepository,
    workspaceCacheService,
  });

  if (!isDefined(authContext)) {
    return dispatch(context);
  }

  return await withWorkspaceAuthContext(authContext, () =>
    dispatch({ ...context, authContext }),
  );
};

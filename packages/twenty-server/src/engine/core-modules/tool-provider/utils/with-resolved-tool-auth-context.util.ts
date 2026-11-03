import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
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

  const userAuthContext = await buildRequiredToolAuthContext({
    context,
    userRepository,
    workspaceCacheService,
  });

  // the agent limits the run, so a user context built here must keep it
  return isDefined(context.agentId) && isUserAuthContext(userAuthContext)
    ? { ...userAuthContext, agentId: context.agentId }
    : userAuthContext;
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

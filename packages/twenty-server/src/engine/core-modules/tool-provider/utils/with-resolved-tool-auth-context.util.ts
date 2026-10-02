import { isDefined } from 'twenty-shared/utils';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolAuthContextDependencies } from 'src/engine/core-modules/tool-provider/types/tool-auth-context-dependencies.type';
import { buildRequiredToolAuthContext } from 'src/engine/core-modules/tool-provider/utils/build-required-tool-auth-context.util';

// Queue workers get no async-local auth context from WorkspaceAuthContextMiddleware, so establish one around the dispatch.
export const withResolvedToolAuthContext = async <T>(
  {
    context,
    userRepository,
    workspaceCacheService,
  }: { context: ToolProviderContext } & ToolAuthContextDependencies,
  dispatch: (contextWithAuth: ToolProviderContext) => Promise<T>,
): Promise<T> => {
  const authContext =
    context.authContext ??
    (isDefined(context.userId) && isDefined(context.userWorkspaceId)
      ? await buildRequiredToolAuthContext({
          context,
          userRepository,
          workspaceCacheService,
        })
      : undefined);

  if (!isDefined(authContext)) {
    return dispatch(context);
  }

  return await withWorkspaceAuthContext(authContext, () =>
    dispatch({ ...context, authContext }),
  );
};

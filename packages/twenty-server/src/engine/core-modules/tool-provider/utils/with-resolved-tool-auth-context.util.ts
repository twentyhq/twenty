import { isDefined } from 'twenty-shared/utils';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolAuthContextDependencies } from 'src/engine/core-modules/tool-provider/types/tool-auth-context-dependencies.type';
import { buildRequiredToolAuthContext } from 'src/engine/core-modules/tool-provider/utils/build-required-tool-auth-context.util';

// Tools are dispatched from queue workers (AI chat, workflows) as well as
// HTTP requests; only the latter get an async-local auth context from
// WorkspaceAuthContextMiddleware. Establish it around the dispatch so any
// tool code relying on getWorkspaceAuthContext() works on every transport.
// Without a resolvable identity the dispatch runs outside any auth context,
// as before.
export const withResolvedToolAuthContext = async <T>(
  {
    context,
    userRepository,
    userWorkspaceRepository,
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
          userWorkspaceRepository,
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

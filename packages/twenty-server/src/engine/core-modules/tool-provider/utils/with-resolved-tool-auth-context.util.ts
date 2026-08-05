import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ToolAuthContextDependencies = {
  userRepository: Pick<Repository<UserEntity>, 'findOne'>;
  workspaceCacheService: Pick<WorkspaceCacheService, 'getOrRecompute'>;
};

export const buildRequiredToolAuthContext = async ({
  context,
  userRepository,
  workspaceCacheService,
}: {
  context: ToolProviderContext;
} & ToolAuthContextDependencies): Promise<WorkspaceAuthContext> => {
  if (!isDefined(context.userId) || !isDefined(context.userWorkspaceId)) {
    throw new AuthException(
      'userId and userWorkspaceId are required for database operations',
      AuthExceptionCode.UNAUTHENTICATED,
    );
  }

  const user = await userRepository.findOne({
    where: { id: context.userId },
  });

  if (!isDefined(user)) {
    throw new AuthException(
      'User not found',
      AuthExceptionCode.UNAUTHENTICATED,
    );
  }

  const { flatWorkspaceMemberMaps } =
    await workspaceCacheService.getOrRecompute(context.workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

  const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[user.id];

  const workspaceMember = isDefined(workspaceMemberId)
    ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
    : undefined;

  if (!isDefined(workspaceMemberId) || !isDefined(workspaceMember)) {
    throw new AuthException(
      'Workspace member not found',
      AuthExceptionCode.UNAUTHENTICATED,
    );
  }

  return buildUserAuthContext({
    workspace: { id: context.workspaceId } as FlatWorkspace,
    userWorkspaceId: context.userWorkspaceId,
    user: fromUserEntityToFlat(user),
    workspaceMemberId,
    workspaceMember,
  });
};

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

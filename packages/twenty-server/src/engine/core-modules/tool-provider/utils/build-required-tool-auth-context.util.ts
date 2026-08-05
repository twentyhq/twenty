import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolAuthContextDependencies } from 'src/engine/core-modules/tool-provider/types/tool-auth-context-dependencies.type';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

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

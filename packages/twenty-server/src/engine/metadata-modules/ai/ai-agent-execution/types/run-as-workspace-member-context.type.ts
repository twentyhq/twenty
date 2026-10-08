import { type ActorMetadata } from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type RunAsWorkspaceMemberContext = {
  actorContext: ActorMetadata;
  authContext: UserWorkspaceAuthContext;
  roleId: string;
};

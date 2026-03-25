import { type ActorMetadata } from 'twenty-shared/types';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  authContext?: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

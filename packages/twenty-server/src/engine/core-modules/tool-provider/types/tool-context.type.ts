import { type ActorMetadata } from 'twenty-shared/types';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

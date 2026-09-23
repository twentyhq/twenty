import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

export type ToolExecutionContext = {
  workspaceId: string;
  authContext?: WorkspaceAuthContext;
  userId?: string;
  userWorkspaceId?: string;
  threadId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

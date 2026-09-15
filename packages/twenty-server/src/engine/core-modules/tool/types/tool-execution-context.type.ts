import { type WorkspaceAuthContextType } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

export type ToolExecutionContext = {
  workspaceId: string;
  userId?: string;
  userWorkspaceId?: string;
  callerType?: WorkspaceAuthContextType;
  threadId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

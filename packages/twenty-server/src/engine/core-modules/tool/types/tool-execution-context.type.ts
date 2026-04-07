import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

export type ToolExecutionContext = {
  workspaceId: string;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

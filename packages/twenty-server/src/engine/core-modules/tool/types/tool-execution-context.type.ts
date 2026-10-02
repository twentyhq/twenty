import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type ToolExecutionContext = {
  workspaceId: string;
  userId?: string;
  userWorkspaceId?: string;
  threadId?: string;
  authContext?: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type ToolProviderContext = {
  workspaceId: string;
  roleId: string;
  rolePermissionConfig: RolePermissionConfig;
  authContext?: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  agent?: FlatAgentWithRoleId | null;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

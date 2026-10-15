import { type ActorMetadata } from 'twenty-shared/types';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export type ToolProviderContext = {
  resolveExecutionContext?: () => Promise<ToolProviderContext>;
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  authContext?: WorkspaceAuthContext;
  application?: FlatApplication;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  agentId?: string;
  threadId?: string;
  locale?: keyof typeof APP_LOCALES;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
  // database tools then only cover the objects this role explicitly grants
  explicitObjectGrantsRoleId?: string;
};

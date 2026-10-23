import { type ActorMetadata } from 'twenty-shared/types';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

export type ToolContext = {
  resolveExecutionContext?: () => Promise<ToolContext>;
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  authContext?: WorkspaceAuthContext;
  // undefined when the caller is no principal an access policy can admit
  authPrincipalVariant: AuthPrincipalVariant | undefined;
  application?: FlatApplication;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  agentId?: string;
  threadId?: string;
  locale?: keyof typeof APP_LOCALES;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

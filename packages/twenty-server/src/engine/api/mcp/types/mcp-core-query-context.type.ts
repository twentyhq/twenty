import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export type McpCoreQueryContext = {
  authContext: WorkspaceAuthContext;
  workspace: FlatWorkspace;
  userId?: string;
  userWorkspaceId?: string;
  apiKey: FlatApiKey | undefined;
  application?: FlatApplication;
  agentId: string | undefined;
  isDirectMode: boolean;
};

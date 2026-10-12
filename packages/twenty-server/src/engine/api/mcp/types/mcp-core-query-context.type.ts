import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export type McpCoreQueryContext = {
  workspace: FlatWorkspace;
  userId?: string;
  userWorkspaceId?: string;
  apiKey: FlatApiKey | undefined;
  application?: FlatApplication;
  agentRoleRestriction: AgentRoleRestriction | undefined;
  isDirectMode: boolean;
};

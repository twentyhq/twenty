import { type ToolSet } from 'ai';
import { type CodeExecutionData } from 'twenty-shared/ai';
import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type CodeExecutionStreamEmitter = (data: CodeExecutionData) => void;

// Unified context for tool generation - used by all consumers
export type ToolProviderContext = {
  workspaceId: string;
  roleId: string;
  rolePermissionConfig: RolePermissionConfig;
  // Optional fields for different use cases
  authContext?: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  userId?: string;
  userWorkspaceId?: string;
  agent?: FlatAgentWithRoleId | null;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

// Options for tool retrieval
export type ToolRetrievalOptions = {
  categories?: ToolCategory[];
  excludeTools?: ToolType[];
  wrapWithErrorContext?: boolean;
};

export interface ToolProvider {
  readonly category: ToolCategory;

  isAvailable(context: ToolProviderContext): Promise<boolean>;

  generateTools(context: ToolProviderContext): Promise<ToolSet>;
}

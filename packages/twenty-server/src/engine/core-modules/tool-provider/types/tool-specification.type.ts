import { type ActorMetadata } from 'twenty-shared/types';

import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type ToolSpecification = {
  workspaceId: string;
  categories: ToolCategory[];
  rolePermissionConfig?: RolePermissionConfig;
  actorContext?: ActorMetadata;
  agent?: FlatAgentWithRoleId | null;
  wrapWithErrorContext?: boolean;
  // Tools to exclude from the generated toolset (security: prevent recursive code execution)
  excludeTools?: ToolType[];
};

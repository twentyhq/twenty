import { type ToolSet } from 'ai';
import {
  type ActorMetadata,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// Object metadata enriched with permission information
export type ObjectWithPermission = {
  objectMetadata: ObjectMetadataForToolSchema;
  restrictedFields: RestrictedFieldsPermissions;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

// Context passed to tool factories
export type ToolGeneratorContext = {
  workspaceId: string;
  authContext?: WorkspaceAuthContext;
  rolePermissionConfig: RolePermissionConfig;
  actorContext?: ActorMetadata;
};

// Factory function type for generating tools from an object
export type ToolFactory = (
  objectWithPermission: ObjectWithPermission,
  context: ToolGeneratorContext,
) => ToolSet;

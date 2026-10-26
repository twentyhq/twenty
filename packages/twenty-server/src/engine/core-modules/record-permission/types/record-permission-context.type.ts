import {
  type RecordCapabilities,
  type RecordPermissionPolicyDefinition,
  type RecordPermissionRule,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RecordPermissionMetadata = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

export type RecordPermissionAuthority = {
  roleId: string;
  roleUniversalIdentifier: string;
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'];
};

export type RecordPermissionAccessGroup = {
  id: string;
  roleUniversalIdentifier: string;
  sourceObjectUniversalIdentifier: string;
  rule: RecordPermissionRule | null;
  filter: RecordGqlOperationFilter | null;
  sharePrincipalIds: string[] | null;
  receiveSourceObjectUniversalIdentifier?: string;
};

export type ResolvedRecordPermissionPathHop = {
  sourceObject: FlatObjectMetadata;
  targetObject: FlatObjectMetadata;
  fieldUniversalIdentifier: string;
  sourceColumn: string;
  targetColumn: string;
};

export type RecordPermissionContext = RecordPermissionMetadata & {
  denyAll?: boolean;
  bindingGeneration?: string;
  revisionId: string;
  definition: RecordPermissionPolicyDefinition;
  schemaName: string;
  authorities: RecordPermissionAuthority[];
  roleUniversalIdentifiersById?: Record<string, string>;
  capabilitiesByObjectUniversalIdentifier: Record<string, RecordCapabilities>;
};

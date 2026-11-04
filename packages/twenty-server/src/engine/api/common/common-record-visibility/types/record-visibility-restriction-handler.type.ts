import { type ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export type RecordVisibilityRestrictionHandler = {
  applyVisibilityRestrictions: (args: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    recordsPermissions: RoleRecordsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }) => Promise<void>;
};

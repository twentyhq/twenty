import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export type RecordVisibilityRestrictionHandler = {
  applyVisibilityRestrictions: (args: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }) => Promise<void>;
};

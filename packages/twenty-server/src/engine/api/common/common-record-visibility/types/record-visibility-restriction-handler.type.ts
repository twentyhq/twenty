import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { type RecordVisibilityRestrictionContext } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RecordVisibilityRestrictionHandler = {
  applyVisibilityRestrictions: (
    args: RecordVisibilityRestrictionContext & {
      records: ObjectRecord[];
      authContext: WorkspaceAuthContext;
    },
  ) => Promise<void>;
  applyEventVisibilityRestrictions?: (
    args: RecordVisibilityRestrictionContext & {
      records: Record<string, unknown>[];
    },
  ) => Promise<void>;
  getRequiredFieldNames?: (args: {
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }) => string[];
};

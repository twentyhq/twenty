import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type DatabaseEventTriggerManifestLookupField = Pick<
  UniversalFlatFieldMetadata,
  | 'universalIdentifier'
  | 'name'
  | 'type'
  | 'objectMetadataUniversalIdentifier'
  | 'universalSettings'
>;

// Maps are listed by priority: the app's own entities first, then the workspace's
export type DatabaseEventTriggerManifestLookup = {
  objectMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >[];
  fieldMaps: {
    byUniversalIdentifier: Partial<
      Record<string, DatabaseEventTriggerManifestLookupField>
    >;
  }[];
};

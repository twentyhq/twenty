import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';

export type AllFlatEntitiesByMetadataEngineName = {
  //   flatFieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata;
  view: FlatView;
  viewField: FlatViewField;
  indexField: FlatIndexFieldMetadata
  index: FlatIndexMetadata
};

import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type AllFlatEntitiesByMetadataEngineName = {
  //   flatFieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata;
  view: FlatView;
  viewField: FlatViewField;
};

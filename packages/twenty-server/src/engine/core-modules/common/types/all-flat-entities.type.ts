import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type AllFlatEntities = {
//   flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  flatView: FlatView;
  flatViewField: FlatViewField;
};
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export type AllFlatEntitiesByMetadataEngineName = {
  //   flatFieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata;
  view: FlatView;
  viewField: FlatViewField;
  index: FlatIndexMetadata;
  serverlessFunction: FlatServerlessFunction;
};

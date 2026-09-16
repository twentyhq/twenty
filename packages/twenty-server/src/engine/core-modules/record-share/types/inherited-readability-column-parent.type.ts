/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type InheritedReadabilityColumnParent = {
  kind: 'column';
  fieldMetadataId: string;
  joinColumnName: string;
  parentFlatObjectMetadata: FlatObjectMetadata;
};

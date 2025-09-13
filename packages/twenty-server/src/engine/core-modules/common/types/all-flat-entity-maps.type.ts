import { type FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type AllFlatEntityMaps = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  //   flatFieldMetadataMaps: FlatObjectMetadataMaps;
  flatViewMaps: FlatViewMaps;
  flatViewFieldMaps: FlatViewFieldMaps;
};

export type AllFlatMapsEntities = keyof AllFlatEntityMaps;

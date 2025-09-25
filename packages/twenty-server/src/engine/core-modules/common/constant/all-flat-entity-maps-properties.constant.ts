import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

export const ALL_FLAT_ENTITY_MAPS_PROPERTIES = [
  'flatObjectMetadataMaps',
  'flatViewFieldMaps',
  'flatViewMaps',
  'flatIndexMaps',
  'flatServerlessFunctionMaps',
] as const satisfies (keyof AllFlatEntityMaps)[];

import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';

export type AllFlatEntities =
  AllFlatEntitiesByMetadataEngineName[keyof AllFlatEntitiesByMetadataEngineName];

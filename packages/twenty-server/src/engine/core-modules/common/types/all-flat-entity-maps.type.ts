import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';

export type AllFlatEntityMaps = {
  [P in keyof AllFlatEntitiesByMetadataEngineName as `flat${Capitalize<P>}Maps`]: FlatEntityMaps<
    AllFlatEntitiesByMetadataEngineName[P]
  >;
};

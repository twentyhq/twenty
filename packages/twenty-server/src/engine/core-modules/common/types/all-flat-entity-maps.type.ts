import { AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type AllFlatEntityMaps = Omit<{
  [P in keyof AllFlatEntitiesByMetadataEngineName as `flat${Capitalize<P>}Maps`]: FlatEntityMaps<
    AllFlatEntitiesByMetadataEngineName[P]
  >;
}, 'flatObjectMetadataMaps'> & {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};

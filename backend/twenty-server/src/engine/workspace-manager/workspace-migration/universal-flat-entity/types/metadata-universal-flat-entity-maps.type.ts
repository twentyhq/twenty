import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export type MetadataUniversalFlatEntityMaps<T extends AllMetadataName> =
  UniversalFlatEntityMaps<
    AllFlatEntityTypesByMetadataName[T]['universalFlatEntity']
  >;

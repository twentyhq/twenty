import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type MetadataFlatEntityMaps<
  T extends AllMetadataName,
  TWithCustomMapsProperties extends boolean = false,
> = TWithCustomMapsProperties extends true
  ? AllFlatEntityTypesByMetadataName[T]['flatEntityMaps']
  : FlatEntityMaps<MetadataFlatEntity<T>>;

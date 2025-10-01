import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

export const EMPTY_ALL_FLAT_ENTITY_MAPS = {
  flatObjectMetadataMaps: {
    ...EMPTY_FLAT_ENTITY_MAPS,
    idByNameSingular: {},
  },
  flatIndexMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatViewFieldMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatViewMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatServerlessFunctionMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatCronTriggerMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatDatabaseEventTriggerMaps: EMPTY_FLAT_ENTITY_MAPS,
} as const satisfies AllFlatEntityMaps;

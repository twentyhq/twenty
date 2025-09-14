import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

export const EMPTY_FLAT_ENTITY_MAPS = {
  byId: {},
  idByUniversalIdentifier: {},
} as const satisfies FlatEntityMaps<FlatEntity>;

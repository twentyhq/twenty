import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

export type FlatEntityMaps<T extends FlatEntity> = {
  byId: Partial<Record<string, T>>;
  idByUniversalIdentifier: Partial<Record<string, string>>;
};

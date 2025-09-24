import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import {
  findFlatEntityByIdInFlatEntityMapsOrThrow,
  type FindFlatEntityByIdInFlatEntityMapsOrThrowArgs,
} from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

export const findFlatEntityByIdInFlatEntityMaps = <T extends FlatEntity>(
  args: FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>,
): T | undefined => {
  try {
    return findFlatEntityByIdInFlatEntityMapsOrThrow(args);
  } catch {
    return undefined;
  }
};

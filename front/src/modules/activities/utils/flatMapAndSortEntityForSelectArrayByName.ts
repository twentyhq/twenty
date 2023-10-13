import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';

export const flatMapAndSortEntityForSelectArrayOfArrayByName = <
  T extends EntityForSelect,
>(
  entityForSelectArray: T[][],
) => {
  const sortByName = (a: T, b: T) => a.name.localeCompare(b.name);

  return entityForSelectArray.flatMap((entity) => entity).sort(sortByName);
};

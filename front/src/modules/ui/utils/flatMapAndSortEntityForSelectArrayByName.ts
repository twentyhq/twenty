import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';

export function flatMapAndSortEntityForSelectArrayOfArrayByName<
  T extends EntityForSelect,
>(entityForSelectArray: T[][]) {
  const sortByName = (a: T, b: T) => a.name.localeCompare(b.name);

  return entityForSelectArray.flatMap((entity) => entity).sort(sortByName);
}

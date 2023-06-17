import { EntityForSelect } from '@/comments/components/MultipleEntitySelect';

export function flatMapAndSortEntityForSelectArrayOfArrayByName(
  entityForSelectArray: EntityForSelect[][],
) {
  const sortByName = (a: EntityForSelect, b: EntityForSelect) =>
    a.name.localeCompare(b.name);

  return entityForSelectArray.flatMap((entity) => entity).sort(sortByName);
}

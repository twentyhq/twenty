import { ViewSort } from '@/views/types/ViewSort';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areViewSortsEqual = (viewSortA: ViewSort, viewSortB: ViewSort) => {
  const propertiesToCompare: (keyof ViewSort)[] = [
    'fieldMetadataId',
    'direction',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewSortA[property],
      viewSortB[property],
    ),
  );
};

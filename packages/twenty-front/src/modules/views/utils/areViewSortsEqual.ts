import { ViewSort } from '@/views/types/ViewSort';

export const areViewSortsEqual = (viewSortA: ViewSort, viewSortB: ViewSort) => {
  const propertiesToCompare: (keyof ViewSort)[] = [
    'fieldMetadataId',
    'direction',
  ];

  return propertiesToCompare.every(
    (property) => viewSortA[property] === viewSortB[property],
  );
};

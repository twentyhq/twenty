import { ViewSort } from '@/views/types/ViewSort';

export const getCombinedViewSorts = (
  viewSort: ViewSort[],
  toUpsertViewSorts: ViewSort[],
  toDeleteViewSortIds: string[],
): ViewSort[] => {
  const toCreateViewSorts = toUpsertViewSorts.filter(
    (toUpsertViewSort) =>
      !viewSort.some((viewSort) => viewSort.id === toUpsertViewSort.id),
  );

  const toUpdateViewSorts = toUpsertViewSorts.filter((toUpsertViewSort) =>
    viewSort.some((viewSort) => viewSort.id === toUpsertViewSort.id),
  );

  const combinedViewSorts = viewSort
    .filter((viewSort) => !toDeleteViewSortIds.includes(viewSort.id))
    .map((viewSort) => {
      const toUpdateViewSort = toUpdateViewSorts.find(
        (toUpdateViewSort) => toUpdateViewSort.id === viewSort.id,
      );

      return toUpdateViewSort ?? viewSort;
    })
    .concat(toCreateViewSorts);

  return Object.values(
    combinedViewSorts.reduce(
      (acc, obj) => ({ ...acc, [obj.fieldMetadataId]: obj }),
      {},
    ),
  );
};

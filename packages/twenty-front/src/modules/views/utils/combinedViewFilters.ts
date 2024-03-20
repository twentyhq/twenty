import { ViewFilter } from '@/views/types/ViewFilter';

export const combinedViewFilters = (
  viewFilter: ViewFilter[],
  toUpsertViewFilters: ViewFilter[],
  toDeleteViewFilterIds: string[],
): ViewFilter[] => {
  const toCreateViewFilters = toUpsertViewFilters.filter(
    (toUpsertViewFilter) =>
      !viewFilter.some((viewFilter) => viewFilter.id === toUpsertViewFilter.id),
  );

  const toUpdateViewFilters = toUpsertViewFilters.filter((toUpsertViewFilter) =>
    viewFilter.some((viewFilter) => viewFilter.id === toUpsertViewFilter.id),
  );

  const combinedViewFilters = viewFilter
    .filter((viewFilter) => !toDeleteViewFilterIds.includes(viewFilter.id))
    .map((viewFilter) => {
      const toUpdateViewFilter = toUpdateViewFilters.find(
        (toUpdateViewFilter) => toUpdateViewFilter.id === viewFilter.id,
      );

      return toUpdateViewFilter ?? viewFilter;
    })
    .concat(toCreateViewFilters);

  return Object.values(
    combinedViewFilters.reduce(
      (acc, obj) => ({ ...acc, [obj.fieldMetadataId]: obj }),
      {},
    ),
  );
};

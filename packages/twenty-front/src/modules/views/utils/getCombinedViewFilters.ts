import { ViewFilter } from '@/views/types/ViewFilter';

export const getCombinedViewFilters = (
  viewFilters: ViewFilter[],
  toUpsertViewFilters: ViewFilter[],
  toDeleteViewFilterIds: string[],
): ViewFilter[] => {
  const toCreateViewFilters = toUpsertViewFilters.filter(
    (toUpsertViewFilter) =>
      !viewFilters.some(
        (viewFilter) =>
          viewFilter.fieldMetadataId === toUpsertViewFilter.fieldMetadataId,
      ),
  );

  const toUpdateViewFilters = toUpsertViewFilters.filter((toUpsertViewFilter) =>
    viewFilters.some(
      (viewFilter) =>
        viewFilter.fieldMetadataId === toUpsertViewFilter.fieldMetadataId,
    ),
  );

  const combinedViewFilters = viewFilters
    .filter((viewFilter) => !toDeleteViewFilterIds.includes(viewFilter.id))
    .map((viewFilter) => {
      const toUpdateViewFilter = toUpdateViewFilters.find(
        (toUpdateViewFilter) =>
          toUpdateViewFilter.fieldMetadataId === viewFilter.fieldMetadataId,
      );

      return toUpdateViewFilter ?? viewFilter;
    })
    .concat(toCreateViewFilters);

  return Object.values(
    combinedViewFilters.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {}),
  );
};

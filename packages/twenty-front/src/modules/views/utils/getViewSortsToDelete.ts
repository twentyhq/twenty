import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';

export const getViewSortsToDelete = (
  currentViewSorts: CoreViewSortEssential[],
  newViewSorts: Pick<CoreViewSortEssential, 'fieldMetadataId'>[],
) => {
  return currentViewSorts.filter(
    (currentViewSort) =>
      !newViewSorts.some(
        (newViewSort) =>
          newViewSort.fieldMetadataId === currentViewSort.fieldMetadataId,
      ),
  );
};

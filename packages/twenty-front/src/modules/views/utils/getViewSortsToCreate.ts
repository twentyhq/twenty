import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewSort } from '~/generated/graphql';

export const getViewSortsToCreate = (
  currentViewSorts: Pick<CoreViewSort, 'fieldMetadataId'>[],
  newViewSorts: CoreViewSortEssential[],
) => {
  return newViewSorts.filter((newViewSort) => {
    const correspondingViewSort = currentViewSorts.find(
      (currentViewSort) =>
        currentViewSort.fieldMetadataId === newViewSort.fieldMetadataId,
    );

    const shouldCreateBecauseViewSortIsNew = !isDefined(correspondingViewSort);

    return shouldCreateBecauseViewSortIsNew;
  });
};

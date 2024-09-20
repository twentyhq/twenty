import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';

import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from '~/utils/isDefined';

export const useCreateViewFiltersAndSorts = () => {
  const { getViewFromCache } = useGetViewFromCache();

  const { createViewSortRecords } = usePersistViewSortRecords();

  const { createViewFilterRecords } = usePersistViewFilterRecords();

  const createViewFiltersAndSorts = async (
    viewIdToCreateOn: string,
    filtersToCreate: ViewFilter[],
    sortsToCreate: ViewSort[],
  ) => {
    const view = await getViewFromCache(viewIdToCreateOn);

    if (!isDefined(view)) {
      return;
    }

    await createViewSortRecords(sortsToCreate, view);
    await createViewFilterRecords(filtersToCreate, view);
  };

  return {
    createViewFiltersAndSorts,
  };
};

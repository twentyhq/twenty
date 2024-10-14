import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';

import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from '~/utils/isDefined';

export const useCreateViewFiltersAndSorts = () => {
  const { getViewFromCache } = useGetViewFromCache();

  const { createViewSortRecords } = usePersistViewSortRecords();

  const { createViewFilterRecords } = usePersistViewFilterRecords();

  const { createViewFilterGroupRecords } = usePersistViewFilterGroupRecords();

  const createViewFiltersAndSorts = async (
    viewIdToCreateOn: string,
    viewFilterGroupsToCreate: ViewFilterGroup[],
    filtersToCreate: ViewFilter[],
    sortsToCreate: ViewSort[],
  ) => {
    const view = await getViewFromCache(viewIdToCreateOn);

    if (!isDefined(view)) {
      return;
    }

    await createViewFilterGroupRecords(viewFilterGroupsToCreate, view);
    await createViewFilterRecords(filtersToCreate, view);
    await createViewSortRecords(sortsToCreate, view);
  };

  return {
    createViewFiltersAndSorts,
  };
};

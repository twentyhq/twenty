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

    const newViewFilterGroupRecordIds = await createViewFilterGroupRecords(
      viewFilterGroupsToCreate,
      view,
    );

    const viewFilterGroupPermanentIdsByTemporaryId = new Map<
      string | undefined,
      string | undefined
    >(
      viewFilterGroupsToCreate.map((viewFilterGroupToCreate, i) => [
        viewFilterGroupToCreate.id,
        newViewFilterGroupRecordIds[i],
      ]),
    );

    await createViewFilterRecords(
      filtersToCreate.map((filterToCreate) => ({
        ...filterToCreate,
        viewFilterGroupId: viewFilterGroupPermanentIdsByTemporaryId.get(
          filterToCreate.viewFilterGroupId,
        ),
      })),
      view,
    );
    await createViewSortRecords(sortsToCreate, view);
  };

  return {
    createViewFiltersAndSorts,
  };
};

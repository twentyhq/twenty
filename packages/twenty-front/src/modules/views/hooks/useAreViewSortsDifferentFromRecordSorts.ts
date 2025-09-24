import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useAreViewSortsDifferentFromRecordSorts = () => {
  const { currentView } = useGetCurrentViewOnly();
  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const viewSortsAreDifferentFromRecordSorts = useMemo(() => {
    const currentViewSorts = currentView?.viewSorts ?? [];
    if (!isDefined(currentView)) {
      return false;
    }
    const viewSortsFromCurrentRecordSorts = currentRecordSorts.map(
      (recordSort) => mapRecordSortToViewSort(recordSort, currentView.id),
    );

    const viewSortsToCreate = getViewSortsToCreate(
      currentViewSorts,
      viewSortsFromCurrentRecordSorts,
    );

    const viewSortsToDelete = getViewSortsToDelete(
      currentViewSorts,
      viewSortsFromCurrentRecordSorts,
    );

    const viewSortsToUpdate = getViewSortsToUpdate(
      currentViewSorts,
      viewSortsFromCurrentRecordSorts,
    );

    const sortsHaveChanged =
      viewSortsToCreate.length > 0 ||
      viewSortsToDelete.length > 0 ||
      viewSortsToUpdate.length > 0;

    return sortsHaveChanged;
  }, [currentRecordSorts, currentView]);

  return { viewSortsAreDifferentFromRecordSorts };
};

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useMemo } from 'react';

export const useAreViewSortsDifferentFromRecordSorts = () => {
  const { currentView } = useGetCurrentViewOnly();
  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const viewSortsAreDifferentFromRecordSorts = useMemo(() => {
    const currentViewSorts = currentView?.viewSorts ?? [];
    const viewSortsFromCurrentRecordSorts = currentRecordSorts.map(
      mapRecordSortToViewSort,
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

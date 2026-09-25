import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const useResetSortDropdown = () => {
  const setSelectedRecordSortDirection = useSetAtomComponentState(
    selectedRecordSortDirectionComponentState,
  );

  const resetSortDropdown = () => {
    setSelectedRecordSortDirection(ViewSortDirection.ASC);
  };

  return {
    resetSortDropdown,
  };
};

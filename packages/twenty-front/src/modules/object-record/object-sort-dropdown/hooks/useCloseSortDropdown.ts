import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getObjectSortDropdownId } from '@/object-record/object-sort-dropdown/utils/getObjectSortDropdownId';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const useCloseSortDropdown = () => {
  const { resetSortDropdown } = useResetSortDropdown();

  const { closeDropdown } = useCloseDropdown();
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const closeSortDropdown = () => {
    closeDropdown(getObjectSortDropdownId(recordIndexId));
    resetSortDropdown();
  };

  return {
    closeSortDropdown,
  };
};

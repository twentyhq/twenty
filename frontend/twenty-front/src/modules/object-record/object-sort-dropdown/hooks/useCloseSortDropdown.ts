import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const useCloseSortDropdown = () => {
  const { resetSortDropdown } = useResetSortDropdown();

  const { closeDropdown } = useCloseDropdown();

  const closeSortDropdown = () => {
    closeDropdown(OBJECT_SORT_DROPDOWN_ID);
    resetSortDropdown();
  };

  return {
    closeSortDropdown,
  };
};

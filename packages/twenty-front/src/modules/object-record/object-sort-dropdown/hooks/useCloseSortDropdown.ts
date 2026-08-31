import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const useCloseSortDropdown = (
  sortDropdownId = OBJECT_SORT_DROPDOWN_ID,
) => {
  const { resetSortDropdown } = useResetSortDropdown();

  const { closeDropdown } = useCloseDropdown();

  const closeSortDropdown = () => {
    closeDropdown(sortDropdownId);
    resetSortDropdown();
  };

  return {
    closeSortDropdown,
  };
};

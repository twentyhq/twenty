import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const useCloseSortDropdown = () => {
  const { resetSortDropdown } = useResetSortDropdown();

  const { closeDropdown } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  const closeSortDropdown = () => {
    closeDropdown();
    resetSortDropdown();
  };

  return {
    closeSortDropdown,
  };
};

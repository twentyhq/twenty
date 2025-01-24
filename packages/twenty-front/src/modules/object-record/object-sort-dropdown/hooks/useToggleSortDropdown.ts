import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const useToggleSortDropdown = () => {
  const { toggleDropdown } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  const { resetSortDropdown } = useResetSortDropdown();

  const toggleSortDropdown = () => {
    toggleDropdown();
    resetSortDropdown();
  };

  return {
    toggleSortDropdown,
  };
};

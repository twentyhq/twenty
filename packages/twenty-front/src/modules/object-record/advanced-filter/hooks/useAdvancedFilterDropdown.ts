import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const useAdvancedFilterDropdown = (viewFilterId?: string) => {
  const advancedFilterDropdownId = `advanced-filter-view-filter-field-${viewFilterId}`;

  const { closeDropdown: closeAdvancedFilterDropdown } = useDropdown(
    advancedFilterDropdownId,
  );

  return {
    closeAdvancedFilterDropdown,
    advancedFilterDropdownId,
  };
};

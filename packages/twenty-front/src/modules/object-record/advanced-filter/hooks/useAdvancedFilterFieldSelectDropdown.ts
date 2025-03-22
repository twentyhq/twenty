import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const useAdvancedFilterFieldSelectDropdown = (viewFilterId?: string) => {
  const advancedFilterFieldSelectDropdownId = `advanced-filter-view-filter-field-${viewFilterId}`;

  const { closeDropdown: closeAdvancedFilterFieldSelectDropdown } = useDropdown(
    advancedFilterFieldSelectDropdownId,
  );

  return {
    closeAdvancedFilterFieldSelectDropdown,
    advancedFilterFieldSelectDropdownId,
  };
};

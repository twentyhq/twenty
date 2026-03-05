import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const useAdvancedFilterFieldSelectDropdown = (viewFilterId?: string) => {
  const advancedFilterFieldSelectDropdownId = `advanced-filter-view-filter-field-${viewFilterId}`;

  const { closeDropdown } = useCloseDropdown();

  const closeAdvancedFilterFieldSelectDropdown = () => {
    closeDropdown(advancedFilterFieldSelectDropdownId);
  };

  return {
    closeAdvancedFilterFieldSelectDropdown,
    advancedFilterFieldSelectDropdownId,
  };
};

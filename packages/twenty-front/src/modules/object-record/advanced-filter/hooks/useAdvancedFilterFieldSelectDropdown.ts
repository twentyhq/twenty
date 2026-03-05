import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const useAdvancedFilterFieldSelectDropdown = (
  recordFilterId?: string,
) => {
  const advancedFilterFieldSelectDropdownId =
    getAdvancedFilterObjectFilterDropdownComponentInstanceId(
      recordFilterId ?? '',
    );

  const { closeDropdown } = useCloseDropdown();

  const closeAdvancedFilterFieldSelectDropdown = () => {
    closeDropdown(advancedFilterFieldSelectDropdownId);
  };

  return {
    closeAdvancedFilterFieldSelectDropdown,
    advancedFilterFieldSelectDropdownId,
  };
};

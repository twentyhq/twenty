import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

export const useAdvancedFilterFieldSelectDropdown = (viewFilterId?: string) => {
  // Resolved once here so the Dropdown, its hotkeys and its selectable list
  // all share the surface-scoped identity the Dropdown registers under.
  const advancedFilterFieldSelectDropdownId =
    useWorkspaceSurfaceScopedComponentInstanceId(
      `advanced-filter-view-filter-field-${viewFilterId}`,
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

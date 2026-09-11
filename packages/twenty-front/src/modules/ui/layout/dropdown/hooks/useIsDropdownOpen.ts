import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Dropdown keeps its state under a surface-scoped id, so a raw dropdownId
// read through the atom directly misses inside a side panel. Resolve it the
// same way useOpenDropdown and useCloseDropdown do.
export const useIsDropdownOpen = (dropdownId?: string) => {
  const dropdownComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
    dropdownId,
  );

  const scopedDropdownComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(dropdownComponentInstanceId);

  return useAtomComponentStateValue(
    isDropdownOpenComponentState,
    scopedDropdownComponentInstanceId,
  );
};

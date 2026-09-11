import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Same contract as useIsDropdownOpen: the placement is written under the
// dropdown's surface-scoped id, so readers resolve the id the same way.
export const useDropdownPlacement = (dropdownId?: string) => {
  const dropdownComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
    dropdownId,
  );

  const scopedDropdownComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(dropdownComponentInstanceId);

  return useAtomComponentStateValue(
    dropdownPlacementComponentState,
    scopedDropdownComponentInstanceId,
  );
};

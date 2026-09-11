import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// ModalStatefulWrapper keeps its state under a surface-scoped id, so a raw
// modalId read through the atom directly misses inside a side panel. Resolve
// it the same way useModal does.
export const useIsModalOpened = (modalId?: string) => {
  const modalComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    ModalComponentInstanceContext,
    modalId,
  );

  const scopedModalComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(modalComponentInstanceId);

  return useAtomComponentStateValue(
    isModalOpenedComponentState,
    scopedModalComponentInstanceId,
  );
};

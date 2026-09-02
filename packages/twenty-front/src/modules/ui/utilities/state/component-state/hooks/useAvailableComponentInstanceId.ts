import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { isNonEmptyString } from '@sniptt/guards';

export const useAvailableComponentInstanceId = <T extends ComponentStateKey>(
  Context: ComponentInstanceStateContext<T>,
): string | null => {
  const instanceStateContext = useComponentInstanceStateContext(Context);

  const instanceIdFromContext = instanceStateContext?.instanceId;
  const workspaceSurfaceScopedInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(instanceIdFromContext ?? '');
  const availableInstanceId =
    instanceStateContext?.shouldScopeToWorkspaceSurface === false
      ? (instanceIdFromContext ?? '')
      : workspaceSurfaceScopedInstanceId;

  return isNonEmptyString(availableInstanceId) ? availableInstanceId : null;
};

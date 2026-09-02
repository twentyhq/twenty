import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { isNonEmptyString } from '@sniptt/guards';

export const useAvailableComponentInstanceIdOrThrow = <
  T extends ComponentStateKey,
>(
  Context: ComponentInstanceStateContext<T>,
  instanceIdFromProps?: string,
): string => {
  const instanceStateContext = useComponentInstanceStateContext(Context);

  const instanceIdFromContext = instanceStateContext?.instanceId;
  const availableInstanceId = isNonEmptyString(instanceIdFromProps)
    ? instanceIdFromProps
    : (instanceIdFromContext ?? '');
  const workspaceSurfaceScopedInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(availableInstanceId);
  const resolvedInstanceId =
    instanceStateContext?.shouldScopeToWorkspaceSurface === false
      ? availableInstanceId
      : workspaceSurfaceScopedInstanceId;

  if (isNonEmptyString(resolvedInstanceId)) {
    return resolvedInstanceId;
  }

  throw new Error(
    'Instance id is not provided and cannot be found in context.',
  );
};

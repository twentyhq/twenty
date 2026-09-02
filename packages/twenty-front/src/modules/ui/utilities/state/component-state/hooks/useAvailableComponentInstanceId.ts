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
  const scopedInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    instanceIdFromContext ?? '',
  );
  const resolvedInstanceId =
    instanceStateContext?.shouldScopeToWorkspaceSurface === false
      ? (instanceIdFromContext ?? '')
      : scopedInstanceId;

  return isNonEmptyString(resolvedInstanceId) ? resolvedInstanceId : null;
};

import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { isNonEmptyString } from '@sniptt/guards';

export const useAvailableComponentInstanceId = <
  T extends { instanceId: string },
>(
  Context: ComponentInstanceStateContext<T>,
): string | null => {
  const instanceStateContext = useComponentInstanceStateContext(Context);

  const instanceIdFromContext = instanceStateContext?.instanceId;
  const scopedInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    instanceIdFromContext ?? '',
  );

  return isNonEmptyString(scopedInstanceId) ? scopedInstanceId : null;
};

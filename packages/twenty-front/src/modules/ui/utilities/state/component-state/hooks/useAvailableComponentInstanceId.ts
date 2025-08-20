import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';

export const useAvailableComponentInstanceId = <
  T extends { instanceId: string },
>(
  Context: ComponentInstanceStateContext<T>,
): string | null => {
  const instanceStateContext = useComponentInstanceStateContext(Context);

  const instanceIdFromContext = instanceStateContext?.instanceId;

  if (isNonEmptyString(instanceIdFromContext)) {
    return instanceIdFromContext;
  } else {
    return null;
  }
};

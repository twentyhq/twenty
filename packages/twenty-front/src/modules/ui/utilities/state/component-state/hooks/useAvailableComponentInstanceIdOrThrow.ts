import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';

export const useAvailableComponentInstanceIdOrThrow = <
  T extends { instanceId: string },
>(
  Context: ComponentInstanceStateContext<T>,
  instanceIdFromProps?: string,
): string => {
  const instanceStateContext = useComponentInstanceStateContext(Context);

  const instanceIdFromContext = instanceStateContext?.instanceId;

  if (isNonEmptyString(instanceIdFromProps)) {
    return instanceIdFromProps;
  } else if (isNonEmptyString(instanceIdFromContext)) {
    return instanceIdFromContext;
  } else {
    throw new Error(
      'Instance id is not provided and cannot be found in context.',
    );
  }
};

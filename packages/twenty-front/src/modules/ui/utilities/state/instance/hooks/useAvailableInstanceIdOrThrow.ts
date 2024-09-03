import { isNonEmptyString } from '@sniptt/guards';

import { useInstanceStateContext } from '@/ui/utilities/state/instance/hooks/useInstanceStateContext';
import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';

export const useAvailableInstanceIdOrThrow = <T extends { instanceId: string }>(
  Context: InstanceStateContext<T>,
  instanceIdFromProps?: string,
): string => {
  const instanceStateContext = useInstanceStateContext(Context);

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

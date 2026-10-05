import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';

// Callers make the id unique where they create it; it is never rewritten here, since some state is deliberately
// shared across surfaces and ids are looked up verbatim as DOM anchors
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
  }

  if (isNonEmptyString(instanceIdFromContext)) {
    return instanceIdFromContext;
  }

  throw new Error(
    'Instance id is not provided and cannot be found in context.',
  );
};

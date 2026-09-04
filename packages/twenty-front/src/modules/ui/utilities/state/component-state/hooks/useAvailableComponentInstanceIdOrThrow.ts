import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';

// Returns the id exactly as provided. Surface isolation happens in the atom key
// instead, from the ComponentSurfaceScope its context declares, so this hook
// stays the identity it has to be: the id it returns also reaches DOM anchors
// and props, which are looked up by the exact string a provider rendered.
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

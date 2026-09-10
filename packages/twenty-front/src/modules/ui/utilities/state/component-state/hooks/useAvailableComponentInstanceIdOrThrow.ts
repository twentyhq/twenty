import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';

// Returns the id exactly as provided. Surface isolation is opted into where an
// id is created (useWorkspaceSurfaceScopedComponentInstanceId at the provider),
// never here: this hook cannot tell state meant to be shared across surfaces
// (a side panel reading the main diagram's flow) from state that must be
// isolated, and ids also escape into DOM anchors that are looked up by the
// exact string a provider rendered.
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

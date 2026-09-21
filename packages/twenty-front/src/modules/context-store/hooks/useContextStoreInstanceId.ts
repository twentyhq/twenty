import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// The surface a component renders on owns its context store: the main outlet
// and a route hosted in the side panel each have one, so a page open on both
// sides keeps its own selection. Reads through a hook resolve this from
// context on their own; imperative store access has to ask for it.
export const useContextStoreInstanceId = () =>
  useComponentInstanceStateContext(ContextStoreComponentInstanceContext)
    ?.instanceId ?? MAIN_CONTEXT_STORE_INSTANCE_ID;

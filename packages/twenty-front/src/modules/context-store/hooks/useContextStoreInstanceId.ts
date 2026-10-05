import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// Each surface owns its context store, so imperative store access must resolve which one.
export const useContextStoreInstanceId = () =>
  useComponentInstanceStateContext(ContextStoreComponentInstanceContext)
    ?.instanceId ?? MAIN_CONTEXT_STORE_INSTANCE_ID;

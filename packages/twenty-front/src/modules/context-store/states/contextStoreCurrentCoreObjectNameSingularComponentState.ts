import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentCoreObjectNameSingularComponentState =
  createAtomComponentState<string | undefined>({
    key: 'contextStoreCurrentCoreObjectNameSingularComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type CommandMenuCoreObjectName } from 'twenty-shared/types';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentCoreObjectNameComponentState =
  createAtomComponentState<CommandMenuCoreObjectName | null>({
    key: 'contextStoreCurrentCoreObjectNameComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

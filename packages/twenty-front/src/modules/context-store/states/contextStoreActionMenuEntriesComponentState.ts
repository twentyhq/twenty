import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ActionMenuEntry } from '../../action-menu/types/ActionMenuEntry';

export const contextStoreActionMenuEntriesComponentState =
  createComponentStateV2<Map<string, ActionMenuEntry>>({
    key: 'contextStoreActionMenuEntriesComponentState',
    defaultValue: new Map(),
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

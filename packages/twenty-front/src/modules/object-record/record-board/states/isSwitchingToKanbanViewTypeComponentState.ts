import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSwitchingToKanbanViewTypeComponentState =
  createComponentState<boolean>({
    key: 'isSwitchingToKanbanViewTypeComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: false,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const switchesToKanbanViewTypeComponentState =
  createComponentState<boolean>({
    key: 'switchesToKanbanViewTypeComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: false,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreIsFullTabWidgetInEditModeComponentState =
  createComponentState<boolean>({
    key: 'contextStoreIsFullTabWidgetInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

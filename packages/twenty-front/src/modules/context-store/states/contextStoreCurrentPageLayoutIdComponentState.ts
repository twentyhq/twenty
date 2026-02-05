import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreCurrentPageLayoutIdComponentState =
  createComponentState<string | undefined>({
    key: 'contextStoreCurrentPageLayoutIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

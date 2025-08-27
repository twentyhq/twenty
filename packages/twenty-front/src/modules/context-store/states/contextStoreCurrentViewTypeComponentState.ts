import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreCurrentViewTypeComponentState =
  createComponentState<ContextStoreViewType | null>({
    key: 'contextStoreCurrentViewTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

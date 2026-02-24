import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const contextStoreCurrentViewTypeComponentState =
  createComponentStateV2<ContextStoreViewType | null>({
    key: 'contextStoreCurrentViewTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

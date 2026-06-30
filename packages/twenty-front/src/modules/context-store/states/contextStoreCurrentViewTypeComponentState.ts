import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentViewTypeComponentState =
  createAtomComponentState<ContextStoreViewType | null>({
    key: 'contextStoreCurrentViewTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

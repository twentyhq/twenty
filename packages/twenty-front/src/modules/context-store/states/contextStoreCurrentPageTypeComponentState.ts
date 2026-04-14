import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ContextStorePageType } from '@/context-store/types/ContextStorePageType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentPageTypeComponentState =
  createAtomComponentState<ContextStorePageType | null>({
    key: 'contextStoreCurrentPageTypeComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStorePageTitleComponentState = createAtomComponentState<
  string | null
>({
  key: 'contextStorePageTitleComponentState',
  defaultValue: null,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});

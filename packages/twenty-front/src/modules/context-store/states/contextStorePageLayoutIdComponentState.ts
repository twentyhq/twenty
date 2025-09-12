import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStorePageLayoutIdComponentState = createComponentState<
  string | undefined
>({
  key: 'contextStorePageLayoutIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});

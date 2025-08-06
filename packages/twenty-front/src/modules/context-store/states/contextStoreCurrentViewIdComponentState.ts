import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreCurrentViewIdComponentState = createComponentState<
  string | undefined
>({
  key: 'contextStoreCurrentViewIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});

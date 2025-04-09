import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreCurrentViewIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'contextStoreCurrentViewIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});

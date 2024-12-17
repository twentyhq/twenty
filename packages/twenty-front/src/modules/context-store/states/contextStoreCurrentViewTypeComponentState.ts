import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreCurrentViewTypeComponentState = createComponentStateV2<
  ContextStoreViewType | undefined
>({
  key: 'contextStoreCurrentViewTypeComponentState',
  defaultValue: undefined,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});

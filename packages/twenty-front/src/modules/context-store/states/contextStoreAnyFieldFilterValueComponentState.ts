import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreAnyFieldFilterValueComponentState =
  createComponentStateV2<string>({
    key: 'contextStoreAnyFieldFilterValueComponentState',
    defaultValue: '',
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

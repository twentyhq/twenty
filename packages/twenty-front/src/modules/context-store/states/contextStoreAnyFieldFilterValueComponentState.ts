import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const contextStoreAnyFieldFilterValueComponentState =
  createComponentState<string>({
    key: 'contextStoreAnyFieldFilterValueComponentState',
    defaultValue: '',
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

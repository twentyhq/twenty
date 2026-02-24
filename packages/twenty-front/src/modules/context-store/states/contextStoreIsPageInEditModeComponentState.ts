import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const contextStoreIsPageInEditModeComponentState =
  createComponentState<boolean>({
    key: 'contextStoreIsPageInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreNumberOfSelectedRecordsComponentState =
  createComponentState<number>({
    key: 'contextStoreNumberOfSelectedRecordsComponentState',
    defaultValue: 0,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

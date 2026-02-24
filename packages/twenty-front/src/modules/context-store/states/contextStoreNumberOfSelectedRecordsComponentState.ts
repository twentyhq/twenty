import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const contextStoreNumberOfSelectedRecordsComponentState =
  createComponentState<number>({
    key: 'contextStoreNumberOfSelectedRecordsComponentState',
    defaultValue: 0,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreNumberOfSelectedRecordsComponentState =
  createComponentStateV2<number>({
    key: 'contextStoreNumberOfSelectedRecordsComponentState',
    defaultValue: 0,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

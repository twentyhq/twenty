import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreNumberOfSelectedRecordsComponentState =
  createAtomComponentState<number>({
    key: 'contextStoreNumberOfSelectedRecordsComponentState',
    defaultValue: 0,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

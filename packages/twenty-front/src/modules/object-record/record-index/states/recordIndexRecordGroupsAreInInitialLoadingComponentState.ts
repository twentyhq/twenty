import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexRecordGroupsAreInInitialLoadingComponentState =
  createAtomComponentState<boolean>({
    key: 'recordIndexRecordGroupsAreInInitialLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

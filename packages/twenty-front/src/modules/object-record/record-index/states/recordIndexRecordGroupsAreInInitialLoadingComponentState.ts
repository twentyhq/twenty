import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordIndexRecordGroupsAreInInitialLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'recordIndexRecordGroupsAreInInitialLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

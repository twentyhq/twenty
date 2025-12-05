import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordIndexRecordGroupsAreInInitialLoadingComponentState =
  createComponentState<boolean>({
    key: 'recordIndexRecordGroupsAreInInitialLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });

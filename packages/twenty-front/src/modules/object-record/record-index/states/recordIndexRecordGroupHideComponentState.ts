import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordGroupHideComponentState =
  createComponentStateV2<boolean>({
    key: 'recordIndexRecordGroupHideComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });

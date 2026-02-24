import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexShouldHideEmptyRecordGroupsComponentState =
  createComponentStateV2<boolean>({
    key: 'recordIndexShouldHideEmptyRecordGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });

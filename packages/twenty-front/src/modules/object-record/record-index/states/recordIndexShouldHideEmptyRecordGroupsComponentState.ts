import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexShouldHideEmptyRecordGroupsComponentState =
  createComponentState<boolean>({
    key: 'recordIndexShouldHideEmptyRecordGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });

import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexShouldHideEmptyRecordGroupsComponentState =
  createAtomComponentState<boolean>({
    key: 'recordIndexShouldHideEmptyRecordGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });

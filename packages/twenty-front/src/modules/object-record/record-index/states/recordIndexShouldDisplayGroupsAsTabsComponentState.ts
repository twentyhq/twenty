import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexShouldDisplayGroupsAsTabsComponentState =
  createAtomComponentState<boolean>({
    key: 'recordIndexShouldDisplayGroupsAsTabsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });

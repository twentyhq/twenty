import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewTab } from '@/views/types/ViewTab';

export const recordIndexViewTabsComponentState = createAtomComponentState<
  ViewTab[]
>({
  key: 'recordIndexViewTabsComponentState',
  defaultValue: [],
  componentInstanceContext: ViewComponentInstanceContext,
});

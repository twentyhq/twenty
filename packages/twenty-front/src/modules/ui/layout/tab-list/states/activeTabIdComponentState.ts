import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const activeTabIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: TabListComponentInstanceContext,
});

import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const activeTabIdComponentState = createComponentState<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: TabListComponentInstanceContext,
});

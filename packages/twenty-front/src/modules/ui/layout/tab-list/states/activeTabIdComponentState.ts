import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const activeTabIdComponentState = createComponentStateV2<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: TabListComponentInstanceContext,
});

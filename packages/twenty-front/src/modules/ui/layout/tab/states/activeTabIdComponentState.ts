import { TabListComponentInstanceContext } from '@/ui/layout/tab/states/contexts/TabListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const activeTabIdComponentState = createComponentStateV2<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: TabListComponentInstanceContext,
});

export const activeTabIdComponentStateV1 = createComponentState<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
});

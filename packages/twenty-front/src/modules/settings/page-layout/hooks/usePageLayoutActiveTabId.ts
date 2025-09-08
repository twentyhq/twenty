import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilState } from 'recoil';

const PAGE_LAYOUT_TABS_INSTANCE_ID = 'page-layout-tabs';

export const usePageLayoutActiveTabId = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    PAGE_LAYOUT_TABS_INSTANCE_ID,
  );

  const setActiveTabId = useSetRecoilState(
    activeTabIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TABS_INSTANCE_ID,
    }),
  );

  return { activeTabId, setActiveTabId };
};

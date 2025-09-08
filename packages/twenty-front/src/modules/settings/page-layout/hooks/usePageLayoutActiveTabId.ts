import { SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID } from '@/settings/page-layout/constants/SettingsPageLayoutTabsInstanceId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilState } from 'recoil';

export const usePageLayoutActiveTabId = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID,
  );

  const setActiveTabId = useSetRecoilState(
    activeTabIdComponentState.atomFamily({
      instanceId: SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID,
    }),
  );

  return { activeTabId, setActiveTabId };
};

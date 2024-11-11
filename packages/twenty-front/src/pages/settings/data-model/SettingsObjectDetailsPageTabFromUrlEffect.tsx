import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SETTINGS_OBJECT_DETAIL_TABS } from '~/pages/settings/data-model/constants/SettingsObjectDetailTabs';

const validHashes = [
  SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.FIELDS,
  SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.SETTINGS,
  SETTINGS_OBJECT_DETAIL_TABS.TABS_IDS.INDEXES,
] as string[];

export const SettingsObjectDetailsPageTabFromUrlEffect = () => {
  const location = useLocation();
  const { activeTabIdState } = useTabList(
    SETTINGS_OBJECT_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );
  const { setActiveTabId } = useTabList(
    SETTINGS_OBJECT_DETAIL_TABS.COMPONENT_INSTANCE_ID,
  );

  const hash = location.hash.replace('#', '');
  const activeTabId = useRecoilValue(activeTabIdState);

  useEffect(() => {
    if (hash === activeTabId) {
      return;
    }

    if (validHashes.includes(hash)) {
      setActiveTabId(hash);
    }
  }, [hash, activeTabId, setActiveTabId]);

  return <></>;
};

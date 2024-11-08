import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { OBJECT_DETAIL_TABS } from '~/pages/settings/data-model/constants/SettingsObjectDetailTabs';

type TabId =
  (typeof OBJECT_DETAIL_TABS.TABS_IDS)[keyof typeof OBJECT_DETAIL_TABS.TABS_IDS];

const validHashes = [
  OBJECT_DETAIL_TABS.TABS_IDS.FIELDS,
  OBJECT_DETAIL_TABS.TABS_IDS.SETTINGS,
  OBJECT_DETAIL_TABS.TABS_IDS.INDEXES,
];

export const SettingsObjectDetailsPageTabFromUrlEffect = () => {
  const location = useLocation();
  const { activeTabIdState } = useTabList(OBJECT_DETAIL_TABS.TAB_LIST_ID);
  const { setActiveTabId } = useTabList(OBJECT_DETAIL_TABS.TAB_LIST_ID);

  const hash = location.hash.replace('#', '');
  const activeTabId = useRecoilValue(activeTabIdState);
  useEffect(() => {
    if (hash === activeTabId) return;

    if (validHashes.includes(hash as TabId)) {
      setActiveTabId(hash as TabId);
    }
  }, [hash, activeTabId, setActiveTabId]);

  return <></>;
};

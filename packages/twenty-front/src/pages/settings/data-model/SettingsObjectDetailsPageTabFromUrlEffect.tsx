import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  FIELDS_TAB_ID,
  INDEXES_TAB_ID,
  SETTINGS_TAB_ID,
  TAB_LIST_COMPONENT_ID,
} from '~/pages/settings/data-model/SettingsObjectDetailPage';

const validHashes = [FIELDS_TAB_ID, SETTINGS_TAB_ID, INDEXES_TAB_ID];

export const SettingsObjectDetailsPageTabFromUrlEffect = () => {
  const location = useLocation();
  const { activeTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const { setActiveTabId } = useTabList(TAB_LIST_COMPONENT_ID);

  const hash = location.hash.replace('#', '');
  const activeTabId = useRecoilValue(activeTabIdState);
  useEffect(() => {
    if (hash === activeTabId) return;

    if (validHashes.includes(hash)) {
      setActiveTabId(hash);
    }
  }, [hash, activeTabId, setActiveTabId]);

  return <></>;
};

import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type TabListFromUrlOptionalEffectProps = {
  componentInstanceId: string;
  tabListIds: string[];
};

export const TabListFromUrlOptionalEffect = ({
  componentInstanceId,
  tabListIds,
}: TabListFromUrlOptionalEffectProps) => {
  const location = useLocation();
  const { activeTabId, setActiveTabId } = useTabList(componentInstanceId);

  const hash = location.hash.replace('#', '');

  useEffect(() => {
    if (hash === activeTabId) {
      return;
    }

    if (tabListIds.includes(hash)) {
      setActiveTabId(hash);
    }
  }, [hash, activeTabId, setActiveTabId, tabListIds]);

  return <></>;
};

import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

type TabListFromUrlOptionalEffectProps = {
  componentInstanceId: string;
  tabListIds: string[];
};

export const TabListFromUrlOptionalEffect = ({
  componentInstanceId,
  tabListIds,
}: TabListFromUrlOptionalEffectProps) => {
  const location = useLocation();
  const { activeTabIdState } = useTabList(componentInstanceId);
  const { setActiveTabId } = useTabList(componentInstanceId);

  const hash = location.hash.replace('#', '');
  const activeTabId = useRecoilValue(activeTabIdState);

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

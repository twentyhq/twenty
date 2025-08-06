import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type TabListFromUrlOptionalEffectProps = {
  tabListIds: string[];
  isInRightDrawer: boolean;
};

export const TabListFromUrlOptionalEffect = ({
  tabListIds,
  isInRightDrawer,
}: TabListFromUrlOptionalEffectProps) => {
  const location = useLocation();
  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);
  const setActiveTabId = useSetRecoilComponentState(activeTabIdComponentState);

  const hash = location.hash.replace('#', '');

  useEffect(() => {
    if (isInRightDrawer) {
      return;
    }

    if (hash === activeTabId) {
      return;
    }

    if (tabListIds.includes(hash)) {
      setActiveTabId(hash);
    }
  }, [hash, activeTabId, setActiveTabId, tabListIds, isInRightDrawer]);

  return <></>;
};

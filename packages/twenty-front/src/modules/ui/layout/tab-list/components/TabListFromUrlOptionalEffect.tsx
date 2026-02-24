import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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
  const activeTabId = useAtomComponentValue(activeTabIdComponentState);
  const setActiveTabId = useSetAtomComponentState(activeTabIdComponentState);

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

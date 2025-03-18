import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  const activeTabId = useRecoilComponentValueV2(activeTabIdComponentState);
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
  );

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

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type TabListFromUrlOptionalEffectProps = {
  tabListIds: string[];
};

export const TabListFromUrlOptionalEffect = ({
  tabListIds,
}: TabListFromUrlOptionalEffectProps) => {
  const workspaceSurface = useWorkspaceSurface();
  const location = useLocation();
  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);
  const setActiveTabId = useSetAtomComponentState(activeTabIdComponentState);

  const hash = location.hash.replace('#', '');

  useEffect(() => {
    if (!workspaceSurface.ownsRouteLocation) {
      return;
    }

    if (hash === activeTabId) {
      return;
    }

    if (tabListIds.includes(hash)) {
      setActiveTabId(hash);
    }
  }, [
    hash,
    activeTabId,
    setActiveTabId,
    tabListIds,
    workspaceSurface.ownsRouteLocation,
  ]);

  return <></>;
};

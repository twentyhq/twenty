import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

type PageLayoutTabListFromUrlOptionalEffectProps = {
  tabListIds: string[];
  isInRightDrawer: boolean;
};

export const PageLayoutTabListFromUrlOptionalEffect = ({
  tabListIds,
  isInRightDrawer,
}: PageLayoutTabListFromUrlOptionalEffectProps) => {
  const location = useLocation();
  const setActiveTabId = useSetRecoilComponentState(activeTabIdComponentState);
  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
  );
  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
  );

  const hash = location.hash.replace('#', '');

  const syncTabFromUrl = useRecoilCallback(
    ({ snapshot }) =>
      ({
        isInRightDrawer,
        hash,
      }: {
        isInRightDrawer: boolean;
        hash: string;
      }) => {
        if (isInRightDrawer) {
          return;
        }

        const isPageLayoutInEditMode = snapshot
          .getLoadable(isPageLayoutInEditModeState)
          .getValue();

        if (isPageLayoutInEditMode === true) {
          return;
        }

        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

        if (hash === activeTabId) {
          return;
        }

        if (tabListIds.includes(hash)) {
          setActiveTabId(hash);
        }
      },
    [isPageLayoutInEditModeState, activeTabIdState, tabListIds, setActiveTabId],
  );

  useEffect(() => {
    syncTabFromUrl({ isInRightDrawer, hash });
  }, [syncTabFromUrl, isInRightDrawer, hash]);

  return <></>;
};

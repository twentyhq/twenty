import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getPageLayoutTabListInitialActiveTabId } from '@/page-layout/utils/getPageLayoutTabListInitialActiveTabId';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutTabListEffectProps = Pick<
  TabListProps,
  'componentInstanceId' | 'onChangeTab'
> & {
  tabs: PageLayoutTab[];
  isInEditMode: boolean;
  defaultTabToFocusOnMobileAndSidePanelId?: string;
};

export const PageLayoutTabListEffect = ({
  tabs,
  isInEditMode,
  onChangeTab,
  componentInstanceId,
  defaultTabToFocusOnMobileAndSidePanelId,
}: PageLayoutTabListEffectProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const store = useStore();
  const isMobile = useIsMobile();
  const workspaceSurface = useWorkspaceSurface();
  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const { hash, search, state } = useLocation();
  const navigate = useNavigate();

  const initialActiveTabId = getPageLayoutTabListInitialActiveTabId({
    activeTabId,
    tabs,
    defaultTabToFocusOnMobileAndSidePanelId,
    isMobile,
    isInSidePanel,
  });

  const shouldSyncWithUrl = !isInEditMode && workspaceSurface.ownsRouteLocation;
  const routeTabId = hash.replace('#', '');
  const nextActiveTabId =
    shouldSyncWithUrl && tabs.some((tab) => tab.id === routeTabId)
      ? routeTabId
      : initialActiveTabId;

  useEffect(() => {
    const activeTabIdAtom = activeTabIdComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

    if (store.get(activeTabIdAtom) === nextActiveTabId) {
      return;
    }

    store.set(activeTabIdAtom, nextActiveTabId);
    onChangeTab?.(nextActiveTabId ?? '');
  }, [componentInstanceId, nextActiveTabId, onChangeTab, store]);

  useEffect(() => {
    // Cancelling customization can pin the active tab again. Replace its stale
    // hash without overwriting a different deep link or the main URL from a panel.
    if (
      shouldSyncWithUrl &&
      isDefined(activeTabId) &&
      isDefined(initialActiveTabId) &&
      activeTabId !== initialActiveTabId &&
      hash === `#${activeTabId}`
    ) {
      navigate(
        { hash: `#${initialActiveTabId}`, search },
        { replace: true, state },
      );
    }
  }, [
    activeTabId,
    hash,
    initialActiveTabId,
    navigate,
    search,
    state,
    shouldSyncWithUrl,
  ]);

  return null;
};

import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getPageLayoutTabListInitialActiveTabId } from '@/page-layout/utils/getPageLayoutTabListInitialActiveTabId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutTabListEffectProps = Pick<
  TabListProps,
  'componentInstanceId' | 'onChangeTab'
> & {
  tabs: PageLayoutTab[];
  defaultTabToFocusOnMobileAndSidePanelId?: string;
};

export const PageLayoutTabListEffect = ({
  tabs,
  onChangeTab,
  componentInstanceId,
  defaultTabToFocusOnMobileAndSidePanelId,
}: PageLayoutTabListEffectProps) => {
  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const isMobile = useIsMobile();
  const { isInSidePanel } = useLayoutRenderingContext();
  const { hash, search } = useLocation();
  const navigate = useNavigate();

  const initialActiveTabId = getPageLayoutTabListInitialActiveTabId({
    activeTabId,
    tabs,
    defaultTabToFocusOnMobileAndSidePanelId,
    isMobile,
    isInSidePanel,
  });

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, onChangeTab, setActiveTabId]);

  useEffect(() => {
    // Cancelling customization can pin the active tab again. Replace its stale
    // hash without overwriting a different deep link or the main URL from a panel.
    if (
      !isInSidePanel &&
      isDefined(activeTabId) &&
      isDefined(initialActiveTabId) &&
      activeTabId !== initialActiveTabId &&
      hash === `#${activeTabId}`
    ) {
      navigate({ hash: `#${initialActiveTabId}`, search }, { replace: true });
    }
  }, [activeTabId, hash, initialActiveTabId, isInSidePanel, navigate, search]);

  return null;
};

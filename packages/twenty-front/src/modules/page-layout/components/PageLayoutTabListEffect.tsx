import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getPageLayoutTabListInitialActiveTabId } from '@/page-layout/utils/getPageLayoutTabListInitialActiveTabId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';

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
  const { isInRightDrawer } = useLayoutRenderingContext();

  const initialActiveTabId = getPageLayoutTabListInitialActiveTabId({
    activeTabId,
    tabs,
    defaultTabToFocusOnMobileAndSidePanelId,
    isMobile,
    isInRightDrawer,
  });

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, onChangeTab, setActiveTabId]);

  return null;
};

import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { getTabPresentation } from '@/page-layout/utils/getTabPresentation';

type PageLayoutMainContentProps = {
  tabId: string;
};

export const PageLayoutMainContent = ({
  tabId,
}: PageLayoutMainContentProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const layoutMode = getTabLayoutMode({
    tab: activeTab,
    pageLayoutType: currentPageLayout.type,
  });

  const presentation = getTabPresentation({
    widgets: activeTab.widgets,
    layoutMode,
    isInEditMode: isPageLayoutInEditMode,
  });

  return (
    <PageLayoutContentProvider
      value={{
        tabId,
        layoutMode,
        presentation,
      }}
    >
      <PageLayoutContent />
    </PageLayoutContentProvider>
  );
};

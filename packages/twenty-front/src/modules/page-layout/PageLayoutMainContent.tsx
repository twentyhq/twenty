import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';

type PageLayoutMainContentProps = {
  tabId: string;
};

export const PageLayoutMainContent = ({
  tabId,
}: PageLayoutMainContentProps) => {
  const { currentPageLayout } = useCurrentPageLayout();

  if (!currentPageLayout) {
    throw new Error('No current page layout found');
  }

  const activeTab = currentPageLayout.tabs.find((tab) => tab.id === tabId);
  const layoutMode = getTabLayoutMode({
    tab: activeTab,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <PageLayoutContentProvider
      value={{
        tabId,
        layoutMode,
      }}
    >
      <PageLayoutContent />
    </PageLayoutContentProvider>
  );
};

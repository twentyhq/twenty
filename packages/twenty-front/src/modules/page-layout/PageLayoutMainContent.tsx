import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { assertPageLayoutTabHasDefinedLayoutModeOrThrow } from '@/page-layout/utils/assertPageLayoutTabHasDefinedLayoutModeOrThrow';

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
  assertPageLayoutTabHasDefinedLayoutModeOrThrow(activeTab);

  return (
    <PageLayoutContentProvider
      value={{
        tabId: activeTab.id,
        layoutMode: activeTab.layoutMode,
      }}
    >
      <PageLayoutContent />
    </PageLayoutContentProvider>
  );
};

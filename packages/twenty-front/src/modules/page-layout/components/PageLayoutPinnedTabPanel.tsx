import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { PageLayoutType } from '~/generated/graphql';

type PageLayoutPinnedTabPanelProps = {
  pinnedTabId: string;
};

export const PageLayoutPinnedTabPanel = ({
  pinnedTabId,
}: PageLayoutPinnedTabPanelProps) => {
  const { currentPageLayout } = useCurrentPageLayout();
  const targetRecordIdentifier = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const pinnedTab = usePageLayoutTabWithVisibleWidgetsOrThrow(pinnedTabId);

  if (currentPageLayout?.type !== PageLayoutType.RECORD_PAGE) {
    return null;
  }

  const layoutMode = getTabLayoutMode({
    tab: pinnedTab,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <ShowPageLeftContainer>
      <SummaryCard
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        objectRecordId={targetRecordIdentifier.id}
        isInRightDrawer={isInRightDrawer}
      />

      <PageLayoutContentProvider
        value={{
          tabId: pinnedTabId,
          layoutMode,
        }}
      >
        <PageLayoutContent />
      </PageLayoutContentProvider>
    </ShowPageLeftContainer>
  );
};

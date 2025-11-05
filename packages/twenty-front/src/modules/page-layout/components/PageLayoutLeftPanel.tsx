import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { assertPageLayoutTabHasDefinedLayoutModeOrThrow } from '@/page-layout/utils/assertPageLayoutTabHasDefinedLayoutModeOrThrow';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { PageLayoutType } from '~/generated/graphql';

type PageLayoutLeftPanelProps = {
  pinnedLeftTabId: string;
};

export const PageLayoutLeftPanel = ({
  pinnedLeftTabId,
}: PageLayoutLeftPanelProps) => {
  const { currentPageLayout } = useCurrentPageLayout();
  const targetRecordIdentifier = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  if (currentPageLayout?.type !== PageLayoutType.RECORD_PAGE) {
    return null;
  }

  const pinnedTab = currentPageLayout.tabs.find(
    (tab) => tab.id === pinnedLeftTabId,
  );

  assertPageLayoutTabHasDefinedLayoutModeOrThrow(pinnedTab);

  return (
    <ShowPageLeftContainer>
      <SummaryCard
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        objectRecordId={targetRecordIdentifier.id}
        isInRightDrawer={isInRightDrawer}
      />

      <PageLayoutContentProvider
        value={{
          tabId: pinnedTab.id,
          layoutMode: pinnedTab.layoutMode,
        }}
      >
        <PageLayoutContent tabId={pinnedLeftTabId} />
      </PageLayoutContentProvider>
    </ShowPageLeftContainer>
  );
};

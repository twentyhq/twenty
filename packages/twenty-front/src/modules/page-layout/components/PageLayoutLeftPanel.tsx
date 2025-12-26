import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { PageLayoutType } from '~/generated/graphql';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-top-left-radius: 8px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
`;

type PageLayoutLeftPanelProps = {
  pinnedLeftTabId: string;
};

export const PageLayoutLeftPanel = ({
  pinnedLeftTabId,
}: PageLayoutLeftPanelProps) => {
  const { currentPageLayout } = useCurrentPageLayout();
  const targetRecordIdentifier = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const pinnedTab = usePageLayoutTabWithVisibleWidgetsOrThrow(pinnedLeftTabId);

  if (currentPageLayout?.type !== PageLayoutType.RECORD_PAGE) {
    return null;
  }

  const layoutMode = getTabLayoutMode({
    tab: pinnedTab,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <StyledContainer>
      <SummaryCard
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        objectRecordId={targetRecordIdentifier.id}
        isInRightDrawer={isInRightDrawer}
      />

      <PageLayoutContentProvider
        value={{
          tabId: pinnedLeftTabId,
          layoutMode,
        }}
      >
        <ScrollWrapper
          componentInstanceId={`page-layout-left-panel-${pinnedLeftTabId}`}
          defaultEnableXScroll={false}
          defaultEnableYScroll={true}
        >
          <PageLayoutContent />
        </ScrollWrapper>
      </PageLayoutContentProvider>
    </StyledContainer>
  );
};

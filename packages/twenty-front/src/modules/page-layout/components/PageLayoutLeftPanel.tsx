import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getScrollWrapperInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutAndRecord';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  --record-card-background-color: ${themeCssVariables.background.secondary};

  background: var(--record-card-background-color);
  border-bottom-left-radius: 8px;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  border-top-left-radius: 8px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  height: 100%;

  .page-layout-scroll-wrapper {
    container-name: tab-viewport;
    container-type: size;
  }
`;

type PageLayoutLeftPanelProps = {
  pageLayoutId: string;
  pinnedLeftTabId: string;
};

export const PageLayoutLeftPanel = ({
  pageLayoutId,
  pinnedLeftTabId,
}: PageLayoutLeftPanelProps) => {
  const { currentPageLayout } = useCurrentPageLayout();
  const targetRecordIdentifier = useTargetRecord();
  const { isInSidePanel, layoutType } = useLayoutRenderingContext();
  const pinnedTab = usePageLayoutTabWithVisibleWidgetsOrThrow(pinnedLeftTabId);

  const scrollWrapperInstanceId =
    getScrollWrapperInstanceIdFromPageLayoutAndRecord({
      pageLayoutId,
      layoutType,
      targetRecordIdentifier,
      isInSidePanel,
      scrollWrapperArea: 'left-panel',
      pageLayoutTabId: pinnedLeftTabId,
    });
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    scrollWrapperInstanceId,
  );

  useEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollWrapperElement.scrollTop = 0;
    }
  }, [getScrollWrapperElement, targetRecordIdentifier.id]);

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
        isInSidePanel={isInSidePanel}
      />

      <PageLayoutContentProvider
        value={{
          tabId: pinnedLeftTabId,
          layoutMode,
        }}
      >
        <ScrollWrapper
          className="page-layout-scroll-wrapper"
          componentInstanceId={scrollWrapperInstanceId}
          defaultEnableXScroll={false}
          defaultEnableYScroll={true}
        >
          <PageLayoutContent />
        </ScrollWrapper>
      </PageLayoutContentProvider>
    </StyledContainer>
  );
};

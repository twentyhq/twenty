import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutVerticalList } from '@/page-layout/components/PageLayoutVerticalList';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { StandaloneWidgetPlaceholder } from '@/page-layout/widgets/components/StandaloneWidgetPlaceholder';
import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { styled } from '@linaria/react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const StyledEmptyStandalonePageContainer = styled.div`
  display: grid;
  height: 100%;
`;

export const PageLayoutContent = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const { layoutMode, tabId } = usePageLayoutContentContext();

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isRecordPageLayout =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE;

  const isGridLayout = layoutMode === PageLayoutTabLayoutMode.GRID;

  const isEmptyStandalonePage =
    currentPageLayout.type === PageLayoutType.STANDALONE_PAGE &&
    activeTab.widgets.length === 0;

  if (isEmptyStandalonePage) {
    return (
      <StyledEmptyStandalonePageContainer>
        <StandaloneWidgetPlaceholder />
      </StyledEmptyStandalonePageContainer>
    );
  }

  if (isGridLayout) {
    return <PageLayoutGridLayout tabId={tabId} />;
  }

  const isVerticalListInEditMode = isPageLayoutInEditMode && isRecordPageLayout;
  const firstViewportFillingWidgetIndex = activeTab.widgets.findIndex(
    (widget) => isViewportFillingWidgetType(widget.type),
  );
  const widgetInsertionIndex =
    firstViewportFillingWidgetIndex === -1
      ? activeTab.widgets.length
      : firstViewportFillingWidgetIndex;

  return (
    <PageLayoutVerticalList
      isInEditMode={isVerticalListInEditMode}
      widgets={activeTab.widgets}
      insertionIndex={widgetInsertionIndex}
      insertionElement={
        isVerticalListInEditMode ? <RecordPageAddWidgetSection /> : undefined
      }
    />
  );
};

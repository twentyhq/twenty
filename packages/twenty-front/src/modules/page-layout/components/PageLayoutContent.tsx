import { PageLayoutCanvasViewer } from '@/page-layout/components/PageLayoutCanvasViewer';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutVerticalListEditor } from '@/page-layout/components/PageLayoutVerticalListEditor';
import { PageLayoutVerticalListViewer } from '@/page-layout/components/PageLayoutVerticalListViewer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { useReorderPageLayoutWidgets } from '@/page-layout/hooks/useReorderPageLayoutWidgets';
import { StandaloneWidgetPlaceholder } from '@/page-layout/widgets/components/StandaloneWidgetPlaceholder';
import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
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

  const { tabId } = usePageLayoutContentContext();

  const { reorderWidgets } = useReorderPageLayoutWidgets(tabId);

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const { layoutMode } = usePageLayoutContentContext();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isRecordPageLayout =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE;

  const isCanvasLayout = layoutMode === PageLayoutTabLayoutMode.CANVAS;
  const isVerticalList = layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;

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

  if (isCanvasLayout) {
    return <PageLayoutCanvasViewer widgets={activeTab.widgets} />;
  }

  if (isVerticalList) {
    if (isPageLayoutInEditMode && isRecordPageLayout) {
      return (
        <PageLayoutVerticalListEditor
          widgets={activeTab.widgets}
          onReorder={reorderWidgets}
          isReorderEnabled={true}
          trailingElement={<RecordPageAddWidgetSection />}
        />
      );
    }

    return <PageLayoutVerticalListViewer widgets={activeTab.widgets} />;
  }

  return <PageLayoutGridLayout tabId={tabId} />;
};

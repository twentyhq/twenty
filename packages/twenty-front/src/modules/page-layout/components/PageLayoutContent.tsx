import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutSoloViewer } from '@/page-layout/components/PageLayoutSoloViewer';
import { PageLayoutVerticalListEditor } from '@/page-layout/components/PageLayoutVerticalListEditor';
import { PageLayoutVerticalListViewer } from '@/page-layout/components/PageLayoutVerticalListViewer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
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

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const { layoutMode, presentation } = usePageLayoutContentContext();

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

  // Edit mode always shows the stack structure, whatever the view-mode
  // presentation is: every tab is edited through the same vertical-list editor.
  if (isPageLayoutInEditMode && isRecordPageLayout) {
    return (
      <PageLayoutVerticalListEditor
        widgets={activeTab.widgets}
        trailingElement={<RecordPageAddWidgetSection />}
      />
    );
  }

  if (presentation === 'solo') {
    return <PageLayoutSoloViewer widgets={activeTab.widgets} />;
  }

  return <PageLayoutVerticalListViewer widgets={activeTab.widgets} />;
};

import { PageLayoutCanvasViewer } from '@/page-layout/components/PageLayoutCanvasViewer';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutVerticalListEditor } from '@/page-layout/components/PageLayoutVerticalListEditor';
import { PageLayoutVerticalListViewer } from '@/page-layout/components/PageLayoutVerticalListViewer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { useReorderPageLayoutWidgets } from '@/page-layout/hooks/useReorderPageLayoutWidgets';
import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

export const PageLayoutContent = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const { tabId } = usePageLayoutContentContext();

  const { reorderWidgets } = useReorderPageLayoutWidgets(tabId);

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const { layoutMode } = usePageLayoutContentContext();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isRecordPageLayout =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE;

  const isRecordPageGlobalEditionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  );

  const isCanvasLayout = layoutMode === PageLayoutTabLayoutMode.CANVAS;
  const isVerticalList = layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;

  if (isCanvasLayout) {
    return <PageLayoutCanvasViewer widgets={activeTab.widgets} />;
  }

  if (isVerticalList) {
    if (
      isPageLayoutInEditMode &&
      isRecordPageLayout &&
      isRecordPageGlobalEditionEnabled
    ) {
      return (
        <PageLayoutVerticalListEditor
          widgets={activeTab.widgets}
          onReorder={reorderWidgets}
          isReorderEnabled={true}
          trailingElement={
            isRecordPageLayout ? <RecordPageAddWidgetSection /> : undefined
          }
        />
      );
    }

    return <PageLayoutVerticalListViewer widgets={activeTab.widgets} />;
  }

  return <PageLayoutGridLayout tabId={tabId} />;
};

import { PageLayoutCanvasViewer } from '@/page-layout/components/PageLayoutCanvasViewer';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutVerticalListEditor } from '@/page-layout/components/PageLayoutVerticalListEditor';
import { PageLayoutVerticalListViewer } from '@/page-layout/components/PageLayoutVerticalListViewer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { useReorderPageLayoutWidgets } from '@/page-layout/hooks/useReorderPageLayoutWidgets';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const PageLayoutContent = () => {
  const isRecordPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const { tabId } = usePageLayoutContentContext();

  const { reorderWidgets } = useReorderPageLayoutWidgets(tabId);

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const { layoutMode } = usePageLayoutContentContext();

  const isCanvasLayout = isRecordPageEnabled && layoutMode === 'canvas';
  const isVerticalList = isRecordPageEnabled && layoutMode === 'vertical-list';

  if (isCanvasLayout) {
    return <PageLayoutCanvasViewer widgets={activeTab.widgets} />;
  }

  if (isVerticalList) {
    return isPageLayoutInEditMode ? (
      <PageLayoutVerticalListEditor
        widgets={activeTab.widgets}
        onReorder={reorderWidgets}
      />
    ) : (
      <PageLayoutVerticalListViewer widgets={activeTab.widgets} />
    );
  }

  return <PageLayoutGridLayout tabId={tabId} />;
};

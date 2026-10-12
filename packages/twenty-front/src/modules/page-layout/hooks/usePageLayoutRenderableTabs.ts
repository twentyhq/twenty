import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { getIsFirstTabPinned } from '@/page-layout/utils/getIsFirstTabPinned';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsRenderableForTargetObject } from '@/page-layout/utils/getTabsRenderableForTargetObject';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const usePageLayoutRenderableTabs = () => {
  const isMobile = useIsMobile();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { objectMetadataItems } = useObjectMetadataItems();
  const widgetVisibilityContext = useWidgetVisibilityContext();

  const targetObjectMetadataItem = isDefined(targetRecordIdentifier)
    ? objectMetadataItems.find(
        (item) =>
          item.nameSingular === targetRecordIdentifier.targetObjectNameSingular,
      )
    : undefined;

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isEditMode: isPageLayoutInEditMode,
    context: widgetVisibilityContext,
  });

  // Edit mode keeps every tab visible so unsupported widgets can still be removed.
  const renderableTabs = isPageLayoutInEditMode
    ? tabsWithVisibleWidgets
    : getTabsRenderableForTargetObject({
        tabs: tabsWithVisibleWidgets,
        targetObjectFields: targetObjectMetadataItem?.fields,
      });

  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    tabs: renderableTabs,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInSidePanel,
    isFirstTabPinned: getIsFirstTabPinned(currentPageLayout),
  });

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};

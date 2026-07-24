import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsRenderableForTargetObject } from '@/page-layout/utils/getTabsRenderableForTargetObject';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

// Single source of truth for which tabs render and which one is pinned, so
// every consumer derives them from the same filtered tab set.
export const usePageLayoutRenderableTabs = () => {
  const isMobile = useIsMobile();
  const { isInSidePanel, targetRecordIdentifier } = useLayoutRenderingContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { objectMetadataItems } = useObjectMetadataItems();

  const targetObjectMetadataItem = isDefined(targetRecordIdentifier)
    ? objectMetadataItems.find(
        (item) =>
          item.nameSingular === targetRecordIdentifier.targetObjectNameSingular,
      )
    : undefined;

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInSidePanel,
    isEditMode: isPageLayoutInEditMode,
  });

  // Edit mode keeps every tab visible (like getTabsWithVisibleWidgets) so a
  // widget the object does not support can still be reached and removed.
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
  });

  return {
    tabsToRenderInTabList,
    pinnedLeftTab,
  };
};

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabsFilteredByFeatureFlags } from '@/page-layout/hooks/usePageLayoutTabsFilteredByFeatureFlags';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const { currentPageLayout } = useCurrentPageLayout();
  const isMobile = useIsMobile();
  const { isInSidePanel, targetRecordIdentifier } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { featureFilteredPageLayoutTabs } =
    usePageLayoutTabsFilteredByFeatureFlags();

  const targetRecordStatus = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    { recordId: targetRecordIdentifier?.id ?? '', fieldName: 'status' },
  );

  const selectedRecords = isDefined(targetRecordIdentifier)
    ? [{ id: targetRecordIdentifier.id, status: targetRecordStatus }]
    : [];

  if (!isDefined(currentPageLayout)) {
    throw new Error('currentPageLayout is not defined');
  }

  const tab = featureFilteredPageLayoutTabs.find((tab) => tab.id === tabId);

  if (!isDefined(tab)) {
    throw new Error('Tab not found');
  }

  const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

  if (isPageLayoutInEditMode) {
    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(activeWidgets)
          : activeWidgets,
    };
  }

  const context = buildWidgetVisibilityContext({
    isMobile,
    isInSidePanel,
    selectedRecords,
  });

  const visibleWidgets = filterVisibleWidgets({
    widgets: activeWidgets,
    context,
  });

  return {
    ...tab,
    widgets:
      tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? sortWidgetsByVerticalListPosition(visibleWidgets)
        : visibleWidgets,
  };
};

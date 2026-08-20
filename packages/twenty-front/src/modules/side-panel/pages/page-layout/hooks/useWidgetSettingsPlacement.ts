import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { shouldShowAddWidgetBelow } from '@/side-panel/pages/page-layout/utils/shouldShowAddWidgetBelow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type WidgetSettingsPlacement = {
  currentTab: PageLayoutTab | undefined;
  isPlacementSectionVisible: boolean;
  pageLayoutEditingWidgetId: string | null;
  showAddWidgetBelow: boolean;
  showMoveDown: boolean;
  showMoveUp: boolean;
};

// Both the rendered placement section and the selectable-item ids that drive
// keyboard navigation read this, so the two can never disagree about which
// actions exist.
export const useWidgetSettingsPlacement = (
  pageLayoutId: string,
): WidgetSettingsPlacement => {
  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const { canMovePageLayoutWidgetUp } =
    useCanMovePageLayoutWidgetUp(pageLayoutId);
  const { canMovePageLayoutWidgetDown } =
    useCanMovePageLayoutWidgetDown(pageLayoutId);

  const currentTab = pageLayoutDraft.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
  );

  const isPlacementSectionVisible =
    isDefined(pageLayoutEditingWidgetId) &&
    isDefined(currentTab) &&
    currentTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;

  if (!isPlacementSectionVisible) {
    return {
      currentTab,
      isPlacementSectionVisible: false,
      pageLayoutEditingWidgetId,
      showAddWidgetBelow: false,
      showMoveDown: false,
      showMoveUp: false,
    };
  }

  return {
    currentTab,
    isPlacementSectionVisible: true,
    pageLayoutEditingWidgetId,
    showAddWidgetBelow: shouldShowAddWidgetBelow({
      currentTab,
      pageLayoutEditingWidgetId,
    }),
    showMoveDown: canMovePageLayoutWidgetDown(pageLayoutEditingWidgetId),
    showMoveUp: canMovePageLayoutWidgetUp(pageLayoutEditingWidgetId),
  };
};

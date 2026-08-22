import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { shouldShowAddWidgetBelow } from '@/side-panel/pages/page-layout/utils/shouldShowAddWidgetBelow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export type WidgetSettingsPlacement = {
  isPlacementSectionVisible: boolean;
  pageLayoutEditingWidgetId: string | null;
  showAddWidgetBelow: boolean;
  showMoveDown: boolean;
  showMoveUp: boolean;
};

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

  const currentTabAndWidget = pageLayoutDraft.tabs
    .map((tab) => ({
      tab,
      widget: tab.widgets.find(
        (widget) => widget.id === pageLayoutEditingWidgetId,
      ),
    }))
    .find(({ widget }) => isDefined(widget));

  const currentTab = currentTabAndWidget?.tab;
  const currentWidget = currentTabAndWidget?.widget;

  const isPlacementSectionVisible =
    isDefined(pageLayoutEditingWidgetId) &&
    isDefined(currentTab) &&
    isDefined(currentWidget) &&
    currentTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;

  if (!isPlacementSectionVisible) {
    return {
      isPlacementSectionVisible: false,
      pageLayoutEditingWidgetId,
      showAddWidgetBelow: false,
      showMoveDown: false,
      showMoveUp: false,
    };
  }

  return {
    isPlacementSectionVisible: true,
    pageLayoutEditingWidgetId,
    showAddWidgetBelow: shouldShowAddWidgetBelow(currentWidget),
    showMoveDown: canMovePageLayoutWidgetDown(pageLayoutEditingWidgetId),
    showMoveUp: canMovePageLayoutWidgetUp(pageLayoutEditingWidgetId),
  };
};

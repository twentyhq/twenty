import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { shouldShowAddWidgetBelow } from '@/side-panel/pages/page-layout/utils/shouldShowAddWidgetBelow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useWidgetSettingsPlacementSelectableItemIds = (
  pageLayoutId: string,
) => {
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

  const showMoveUp =
    isDefined(pageLayoutEditingWidgetId) &&
    canMovePageLayoutWidgetUp(pageLayoutEditingWidgetId);

  const showMoveDown =
    isDefined(pageLayoutEditingWidgetId) &&
    canMovePageLayoutWidgetDown(pageLayoutEditingWidgetId);

  const currentTab = pageLayoutDraft.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
  );

  if (
    !isDefined(currentTab) ||
    currentTab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return { placementSelectableItemIds: [] };
  }

  const showAddWidgetBelow = shouldShowAddWidgetBelow({
    currentTab,
    pageLayoutEditingWidgetId,
  });

  const placementSelectableItemIds = [
    ...(showMoveUp ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_UP] : []),
    ...(showMoveDown ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_DOWN] : []),
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
    ...(showAddWidgetBelow
      ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW]
      : []),
  ];

  return { placementSelectableItemIds };
};

import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useWidgetSettingsPlacementSelectableItemIds = (
  pageLayoutId: string,
) => {
  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
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

  const placementSelectableItemIds = [
    ...(showMoveUp ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_UP] : []),
    ...(showMoveDown ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_DOWN] : []),
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW,
  ];

  return { placementSelectableItemIds };
};

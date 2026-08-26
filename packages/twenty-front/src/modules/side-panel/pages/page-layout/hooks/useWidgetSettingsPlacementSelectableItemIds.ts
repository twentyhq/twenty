import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useWidgetSettingsPlacement } from '@/side-panel/pages/page-layout/hooks/useWidgetSettingsPlacement';

export const useWidgetSettingsPlacementSelectableItemIds = (
  pageLayoutId: string,
) => {
  const widgetSettingsPlacement = useWidgetSettingsPlacement(pageLayoutId);

  const {
    isPlacementSectionVisible,
    showAddWidgetBelow,
    showMoveDown,
    showMoveUp,
  } = widgetSettingsPlacement;

  if (!isPlacementSectionVisible) {
    return {
      placementSelectableItemIds: [],
      widgetSettingsPlacement,
    };
  }

  const placementSelectableItemIds = [
    ...(showMoveUp ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_UP] : []),
    ...(showMoveDown ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_DOWN] : []),
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
    ...(showAddWidgetBelow
      ? [WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW]
      : []),
  ];

  return { placementSelectableItemIds, widgetSettingsPlacement };
};

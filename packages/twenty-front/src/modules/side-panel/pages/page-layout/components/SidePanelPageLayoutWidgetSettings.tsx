import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { WidgetSettingsManageSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsManageSection';
import { WidgetSettingsPlacementSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsPlacementSection';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useWidgetSettingsPlacementSelectableItemIds } from '@/side-panel/pages/page-layout/hooks/useWidgetSettingsPlacementSelectableItemIds';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutWidgetSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { placementSelectableItemIds, widgetSettingsPlacement } =
    useWidgetSettingsPlacementSelectableItemIds(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const selectableItemIds = [
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.REPLACE_WIDGET,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.DELETE_WIDGET,
    ...placementSelectableItemIds,
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <WidgetSettingsManageSection pageLayoutId={pageLayoutId} />
      <WidgetSettingsPlacementSection
        pageLayoutId={pageLayoutId}
        isPlacementSectionVisible={
          widgetSettingsPlacement.isPlacementSectionVisible
        }
        pageLayoutEditingWidgetId={
          widgetSettingsPlacement.pageLayoutEditingWidgetId
        }
        showAddWidgetBelow={widgetSettingsPlacement.showAddWidgetBelow}
        showMoveDown={widgetSettingsPlacement.showMoveDown}
        showMoveUp={widgetSettingsPlacement.showMoveUp}
      />
    </SidePanelList>
  );
};

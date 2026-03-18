import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { ChartFiltersSettings } from '@/side-panel/pages/page-layout/components/ChartFiltersSettings';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isChartWidget } from '@/side-panel/pages/page-layout/utils/isChartWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelChartFilterSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const widgetInEditMode = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  if (
    !isDefined(widgetInEditMode) ||
    !isChartWidget(widgetInEditMode) ||
    !isDefined(widgetInEditMode.objectMetadataId)
  ) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for id ${widgetInEditMode.objectMetadataId}`,
    );
  }

  return (
    <ChartFiltersSettings
      widget={widgetInEditMode}
      objectMetadataItem={objectMetadataItem}
    />
  );
};

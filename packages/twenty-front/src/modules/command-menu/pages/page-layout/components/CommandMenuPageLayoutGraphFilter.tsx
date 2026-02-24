import { ChartFiltersSettings } from '@/command-menu/pages/page-layout/components/ChartFiltersSettings';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isChartWidget } from '@/command-menu/pages/page-layout/utils/isChartWidget';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuPageLayoutGraphFilter = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const draftPageLayout = useAtomComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const widgetInEditMode = draftPageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  if (
    !isDefined(widgetInEditMode) ||
    !isDefined(widgetInEditMode.objectMetadataId) ||
    !isChartWidget(widgetInEditMode)
  ) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === widgetInEditMode?.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for id ${widgetInEditMode?.objectMetadataId}`,
    );
  }

  return (
    <>
      <ChartFiltersSettings
        widget={widgetInEditMode}
        objectMetadataItem={objectMetadataItem}
      />
    </>
  );
};

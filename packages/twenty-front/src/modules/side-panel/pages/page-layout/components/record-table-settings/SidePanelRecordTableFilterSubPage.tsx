import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordTableFilterSubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const viewId = isDefined(widgetInEditMode)
    ? getWidgetConfigurationViewId(widgetInEditMode.configuration)
    : null;

  const { view } = useRecordTableWidgetViewForDisplay({
    viewId: viewId ?? '',
    widgetId: widgetInEditMode?.id ?? '',
    pageLayoutId,
  });

  if (!isDefined(widgetInEditMode) || !isDefined(viewId) || !isDefined(view)) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      viewId={viewId}
      widgetId={widgetInEditMode.id}
      pageLayoutId={pageLayoutId}
      objectMetadataId={view.objectMetadataId}
    />
  );
};

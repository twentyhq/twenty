import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { useRecordTableWidgetInEditModeView } from '@/side-panel/pages/page-layout/hooks/useRecordTableWidgetInEditModeView';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordTableFilterSubPage = () => {
  const { pageLayoutId, widgetId, viewId, view } =
    useRecordTableWidgetInEditModeView();

  if (!isDefined(widgetId) || !isDefined(viewId) || !isDefined(view)) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      viewId={viewId}
      widgetId={widgetId}
      pageLayoutId={pageLayoutId}
      objectMetadataId={view.objectMetadataId}
    />
  );
};

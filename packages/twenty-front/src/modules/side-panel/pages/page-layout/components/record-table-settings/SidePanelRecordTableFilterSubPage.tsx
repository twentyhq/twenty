import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { useRecordTableWidgetInEditModeView } from '@/side-panel/pages/page-layout/hooks/useRecordTableWidgetInEditModeView';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordTableFilterSubPage = () => {
  const { pageLayoutId, widgetInEditMode, view } =
    useRecordTableWidgetInEditModeView();

  if (!isDefined(widgetInEditMode) || !isDefined(view)) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      view={view}
      widgetId={widgetInEditMode.id}
      pageLayoutId={pageLayoutId}
    />
  );
};

import { RecordTableSettingsSorts } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSorts';
import { useRecordTableWidgetInEditModeView } from '@/side-panel/pages/page-layout/hooks/useRecordTableWidgetInEditModeView';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordTableSortSubPage = () => {
  const { pageLayoutId, widgetInEditMode, view } =
    useRecordTableWidgetInEditModeView();

  if (!isDefined(widgetInEditMode) || !isDefined(view)) {
    return null;
  }

  return (
    <RecordTableSettingsSorts
      view={view}
      widgetId={widgetInEditMode.id}
      pageLayoutId={pageLayoutId}
    />
  );
};

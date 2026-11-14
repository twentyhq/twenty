import { RecordTableSettingsSorts } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSorts';
import { useRecordTableWidgetInEditModeView } from '@/side-panel/pages/page-layout/hooks/useRecordTableWidgetInEditModeView';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRecordTableSortSubPage = () => {
  const { pageLayoutId, widgetId, viewId, view } =
    useRecordTableWidgetInEditModeView();

  if (!isDefined(widgetId) || !isDefined(viewId) || !isDefined(view)) {
    return null;
  }

  return (
    <RecordTableSettingsSorts
      viewId={viewId}
      widgetId={widgetId}
      pageLayoutId={pageLayoutId}
      objectMetadataId={view.objectMetadataId}
    />
  );
};

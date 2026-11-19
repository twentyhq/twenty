import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableWidgetInEditModeView = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const viewId = isDefined(widgetInEditMode)
    ? getWidgetConfigurationViewId(widgetInEditMode.configuration)
    : null;

  // Hooks run before callers can return early; an empty id simply finds no view
  const { view } = useRecordTableWidgetViewForDisplay({
    viewId: viewId ?? '',
    widgetId: widgetInEditMode?.id ?? '',
    pageLayoutId,
  });

  return { pageLayoutId, widgetInEditMode, viewId, view };
};

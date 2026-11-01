import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const SidePanelRecordTableFilterSubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const { configuration } = widgetInEditMode;

  const isRecordTableConfiguration =
    configuration.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const viewId =
    isRecordTableConfiguration &&
    'viewId' in configuration &&
    isDefined(configuration.viewId)
      ? (configuration.viewId as string)
      : undefined;

  if (!isDefined(viewId) || !isDefined(widgetInEditMode.objectMetadataId)) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      viewId={viewId}
      widgetId={widgetInEditMode.id}
      pageLayoutId={pageLayoutId}
      objectMetadataId={widgetInEditMode.objectMetadataId}
    />
  );
};

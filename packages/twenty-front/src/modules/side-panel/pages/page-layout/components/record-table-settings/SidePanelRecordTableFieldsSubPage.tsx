import { RecordTableSettingsFieldVisibility } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFieldVisibility';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const SidePanelRecordTableFieldsSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
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

  if (!isDefined(viewId)) {
    return null;
  }

  return <RecordTableSettingsFieldVisibility viewId={viewId} />;
};

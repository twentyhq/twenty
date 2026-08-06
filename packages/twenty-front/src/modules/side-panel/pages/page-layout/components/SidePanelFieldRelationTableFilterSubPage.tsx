import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { RecordTableSettingsFilters } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFilters';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isDefined } from 'twenty-shared/utils';
import { type FieldConfiguration } from '~/generated-metadata/graphql';

export const SidePanelFieldRelationTableFilterSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode) || !isDefined(widgetInEditMode.configuration)) {
    return null;
  }

  const fieldConfiguration = widgetInEditMode.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;

  const { fieldMetadataItem } = useFieldMetadataItemById(
    currentFieldMetadataId ?? '',
  );

  const targetObjectMetadataId =
    fieldMetadataItem?.relation?.targetObjectMetadata.id;

  const viewId = getWidgetConfigurationViewId(widgetInEditMode.configuration);

  if (!isDefined(viewId) || !isDefined(targetObjectMetadataId)) {
    return null;
  }

  return (
    <RecordTableSettingsFilters
      viewId={viewId}
      widgetId={widgetInEditMode.id}
      pageLayoutId={pageLayoutId}
      objectMetadataId={targetObjectMetadataId}
    />
  );
};

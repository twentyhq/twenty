import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartGroupByFieldSelectionAxis } from '@/side-panel/pages/page-layout/types/ChartGroupByFieldSelectionAxis';
import { buildChartGroupByFieldConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';

export const useChartGroupByFieldSelection = ({
  axis,
}: {
  axis: ChartGroupByFieldSelectionAxis;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const configuration = widgetInEditMode?.configuration;
  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  if (
    axis === 'pie' &&
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')
  ) {
    const selectField = ({
      fieldId,
      subFieldName = null,
    }: {
      fieldId: string | null;
      subFieldName?: string | null;
    }) => {
      updateCurrentWidgetConfig({
        configToUpdate: buildChartGroupByFieldConfigUpdate({
          configuration,
          fieldMetadataIdKey: 'groupByFieldMetadataId',
          subFieldNameKey: 'groupBySubFieldName',
          fieldId,
          subFieldName,
          objectMetadataItem: sourceObjectMetadataItem,
          objectMetadataItems,
        }),
      });
    };

    return {
      currentGroupByFieldMetadataId: configuration.groupByFieldMetadataId,
      currentSubFieldName: configuration.groupBySubFieldName,
      sourceObjectMetadataItem,
      selectField,
    };
  }

  const isCartesianChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (axis === 'pie' || !isCartesianChart) {
    return null;
  }

  const fieldMetadataIdKey =
    axis === 'primary'
      ? 'primaryAxisGroupByFieldMetadataId'
      : 'secondaryAxisGroupByFieldMetadataId';
  const subFieldNameKey =
    axis === 'primary'
      ? 'primaryAxisGroupBySubFieldName'
      : 'secondaryAxisGroupBySubFieldName';

  const selectField = ({
    fieldId,
    subFieldName = null,
  }: {
    fieldId: string | null;
    subFieldName?: string | null;
  }) => {
    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId,
        subFieldName,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
  };

  return {
    currentGroupByFieldMetadataId: configuration[fieldMetadataIdKey],
    currentSubFieldName: configuration[subFieldNameKey],
    sourceObjectMetadataItem,
    selectField,
  };
};

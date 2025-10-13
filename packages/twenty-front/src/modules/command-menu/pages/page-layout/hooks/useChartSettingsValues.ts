import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getBarChartAxisFields } from '@/command-menu/pages/page-layout/utils/getBarChartAxisFields';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useChartSettingsValues = ({
  objectMetadataId,
  configuration,
}: {
  objectMetadataId: string;
  configuration?: ChartConfiguration;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
  );

  const { getXSortOptionLabel } = useGraphXSortOptionLabels({
    objectMetadataId,
  });

  const { getGroupBySortOptionLabel } = useGraphGroupBySortOptionLabels({
    objectMetadataId,
  });

  if (!configuration) {
    return {
      getChartSettingsValues: () => undefined,
    };
  }

  const barAxisFields =
    configuration.__typename === 'BarChartConfiguration'
      ? getBarChartAxisFields(configuration)
      : undefined;

  const barPrimaryField =
    configuration.__typename === 'BarChartConfiguration' &&
    isDefined(configuration.primaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.primaryAxisGroup,
        )
      : undefined;

  const barSecondaryField =
    configuration.__typename === 'BarChartConfiguration' &&
    isDefined(configuration.secondaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.secondaryAxisGroup,
        )
      : undefined;

  const barXField =
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.xFieldId === configuration.primaryAxisGroup
        ? (barPrimaryField ?? barSecondaryField)
        : (barSecondaryField ?? barPrimaryField)
      : undefined;

  const barYField =
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.yFieldId === configuration.secondaryAxisGroup
        ? (barSecondaryField ?? barPrimaryField)
        : (barPrimaryField ?? barSecondaryField)
      : undefined;

  const barXOrderBy =
    configuration.__typename === 'BarChartConfiguration'
      ? configuration.primaryAxisOrderBy
      : undefined;

  const barYOrderBy =
    configuration.__typename === 'BarChartConfiguration'
      ? configuration.secondaryAxisOrderBy
      : undefined;

  const linePrimaryField =
    configuration.__typename === 'LineChartConfiguration' &&
    isDefined(configuration.primaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.primaryAxisGroup,
        )
      : undefined;

  const lineSecondaryField =
    configuration.__typename === 'LineChartConfiguration' &&
    isDefined(configuration.secondaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.secondaryAxisGroup,
        )
      : undefined;

  const groupByFieldX =
    configuration.__typename === 'BarChartConfiguration'
      ? barXField
      : linePrimaryField;

  const groupByFieldXId =
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.xFieldId
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.primaryAxisGroup
        : undefined;

  const groupBySubFieldNameX = (
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.xSubFieldName
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.primaryAxisSubFieldName
        : undefined
  ) as CompositeFieldSubFieldName | undefined;

  const groupBySubFieldNameXLabel =
    isDefined(groupBySubFieldNameX) && isDefined(groupByFieldX)
      ? getFieldLabelWithSubField({
          field: groupByFieldX,
          subFieldName: groupBySubFieldNameX,
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const groupByFieldY =
    configuration.__typename === 'BarChartConfiguration'
      ? barYField
      : lineSecondaryField;

  const groupByFieldYId =
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.yFieldId
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.secondaryAxisGroup
        : undefined;

  const groupBySubFieldNameY = (
    configuration.__typename === 'BarChartConfiguration'
      ? barAxisFields?.ySubFieldName
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.secondaryAxisSubFieldName
        : undefined
  ) as CompositeFieldSubFieldName | undefined;

  const xAxisOrderBy =
    configuration.__typename === 'BarChartConfiguration'
      ? barXOrderBy
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.primaryAxisOrderBy
        : undefined;

  const xAxisOrderByLabel =
    isDefined(xAxisOrderBy) && isDefined(groupByFieldXId)
      ? getXSortOptionLabel({
          graphOrderBy: xAxisOrderBy,
          groupByFieldMetadataIdX: groupByFieldXId,
          groupBySubFieldNameX: groupBySubFieldNameX,
          aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
          aggregateOperation: configuration.aggregateOperation ?? undefined,
        })
      : undefined;

  const groupByOrderBy =
    configuration.__typename === 'BarChartConfiguration'
      ? barYOrderBy
      : configuration.__typename === 'LineChartConfiguration'
        ? configuration.secondaryAxisOrderBy
        : configuration.__typename === 'PieChartConfiguration'
          ? configuration.orderBy
          : undefined;

  const groupByOrderByLabel =
    isDefined(groupByOrderBy) &&
    getGroupBySortOptionLabel({
      graphOrderBy: groupByOrderBy,
      groupByFieldMetadataId:
        configuration.__typename === 'PieChartConfiguration'
          ? configuration.groupByFieldMetadataId
          : groupByFieldYId,
      groupBySubFieldName: (configuration.__typename === 'PieChartConfiguration'
        ? configuration.groupBySubFieldName
        : groupBySubFieldNameY) as CompositeFieldSubFieldName | undefined,
    });

  const getChartSettingsValues = (
    itemId: CHART_CONFIGURATION_SETTING_IDS,
  ): boolean | string | undefined => {
    switch (itemId) {
      case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
        return objectMetadataItem?.labelPlural;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
        return groupBySubFieldNameXLabel ?? groupByFieldX?.label;
      case CHART_CONFIGURATION_SETTING_IDS.COLORS:
        return 'color' in configuration && isDefined(configuration.color)
          ? capitalize(configuration.color)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y: {
        const hasAggregateLabel = isDefined(aggregateField?.label);
        const hasAggregateOperation = isDefined(yAxisAggregateOperation);

        return `${aggregateField?.label ?? ''}${
          hasAggregateLabel && hasAggregateOperation
            ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})`
            : ''
        }`;
      }
      case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY:
        return groupByFieldY?.label;
      case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
        return 'axisNameDisplay' in configuration &&
          isDefined(configuration.axisNameDisplay)
          ? getChartAxisNameDisplayOptions(configuration.axisNameDisplay)
          : undefined;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_X:
        return xAxisOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD:
        return groupByOrderByLabel;
      case CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS:
        return configuration.displayDataLabel ?? undefined;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};

import { useGraphGroupBySortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphGroupBySortOptionLabels';
import { useGraphXSortOptionLabels } from '@/command-menu/pages/page-layout/hooks/useGraphXSortOptionLabels';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { GraphType } from '~/generated-metadata/graphql';

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

  const resolveBarAxisFields = () => {
    if (
      configuration.__typename !== 'BarChartConfiguration' ||
      !('graphType' in configuration)
    ) {
      return undefined;
    }

    const primaryField = isDefined(configuration.primaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.primaryAxisGroup,
        )
      : undefined;

    const secondaryField = isDefined(configuration.secondaryAxisGroup)
      ? objectMetadataItem?.fields.find(
          (field) => field.id === configuration.secondaryAxisGroup,
        )
      : undefined;

    const isVertical = configuration.graphType === GraphType.VERTICAL_BAR;

    const xField = isVertical
      ? (primaryField ?? secondaryField)
      : (secondaryField ?? primaryField);
    const yField = isVertical
      ? (secondaryField ?? primaryField)
      : (primaryField ?? secondaryField);

    const xFieldId = isVertical
      ? (configuration.primaryAxisGroup ?? configuration.secondaryAxisGroup)
      : (configuration.secondaryAxisGroup ?? configuration.primaryAxisGroup);

    const yFieldId = isVertical
      ? (configuration.secondaryAxisGroup ?? configuration.primaryAxisGroup)
      : (configuration.primaryAxisGroup ?? configuration.secondaryAxisGroup);

    const xSubFieldName = isVertical
      ? (configuration.primaryAxisSubFieldName ??
        configuration.secondaryAxisSubFieldName)
      : (configuration.secondaryAxisSubFieldName ??
        configuration.primaryAxisSubFieldName);

    const ySubFieldName = isVertical
      ? (configuration.secondaryAxisSubFieldName ??
        configuration.primaryAxisSubFieldName)
      : (configuration.primaryAxisSubFieldName ??
        configuration.secondaryAxisSubFieldName);

    const xOrderBy = isVertical
      ? (configuration.primaryAxisOrderBy ?? configuration.secondaryAxisOrderBy)
      : (configuration.secondaryAxisOrderBy ??
        configuration.primaryAxisOrderBy);

    const yOrderBy = isVertical
      ? (configuration.secondaryAxisOrderBy ?? configuration.primaryAxisOrderBy)
      : (configuration.primaryAxisOrderBy ??
        configuration.secondaryAxisOrderBy);

    return {
      xField,
      yField,
      xFieldId,
      yFieldId,
      xSubFieldName,
      ySubFieldName,
      xOrderBy,
      yOrderBy,
    };
  };

  const barAxisFields = resolveBarAxisFields();

  const groupByFieldX =
    'groupByFieldMetadataIdX' in configuration
      ? objectMetadataItem?.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
        )
      : barAxisFields?.xField;

  const groupByFieldXId =
    'groupByFieldMetadataIdX' in configuration
      ? configuration.groupByFieldMetadataIdX
      : barAxisFields?.xFieldId;

  const groupBySubFieldNameX =
    'groupBySubFieldNameX' in configuration
      ? configuration.groupBySubFieldNameX
      : barAxisFields?.xSubFieldName;

  const groupBySubFieldNameXLabel =
    isDefined(groupBySubFieldNameX) && isDefined(groupByFieldX)
      ? getFieldLabelWithSubField({
          field: groupByFieldX,
          subFieldName: groupBySubFieldNameX as CompositeFieldSubFieldName,
        })
      : undefined;

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const groupByFieldY =
    'groupByFieldMetadataIdY' in configuration
      ? objectMetadataItem?.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === configuration.groupByFieldMetadataIdY,
        )
      : barAxisFields?.yField;

  const groupByFieldYId =
    'groupByFieldMetadataIdY' in configuration
      ? configuration.groupByFieldMetadataIdY
      : barAxisFields?.yFieldId;

  const groupBySubFieldNameY =
    'groupBySubFieldNameY' in configuration
      ? configuration.groupBySubFieldNameY
      : barAxisFields?.ySubFieldName;

  const xAxisOrderBy =
    'orderByX' in configuration
      ? configuration.orderByX
      : barAxisFields?.xOrderBy;

  const xAxisOrderByLabel =
    isDefined(xAxisOrderBy) && isDefined(groupByFieldXId)
      ? getXSortOptionLabel({
          graphOrderBy: xAxisOrderBy,
          groupByFieldMetadataIdX: groupByFieldXId,
          groupBySubFieldNameX:
            groupBySubFieldNameX as CompositeFieldSubFieldName,
          aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
          aggregateOperation: configuration.aggregateOperation ?? undefined,
        })
      : undefined;

  const groupByOrderBy =
    'orderByY' in configuration
      ? configuration.orderByY
      : 'orderBy' in configuration
        ? configuration.orderBy
        : barAxisFields?.yOrderBy;

  const groupByOrderByLabel =
    isDefined(groupByOrderBy) &&
    getGroupBySortOptionLabel({
      graphOrderBy: groupByOrderBy,
      groupByFieldMetadataId:
        'groupByFieldMetadataIdY' in configuration
          ? configuration.groupByFieldMetadataIdY
          : 'groupByFieldMetadataId' in configuration
            ? configuration.groupByFieldMetadataId
            : groupByFieldYId,
      groupBySubFieldName:
        'groupBySubFieldNameY' in configuration
          ? (configuration.groupBySubFieldNameY as CompositeFieldSubFieldName)
          : 'groupBySubFieldName' in configuration
            ? (configuration.groupBySubFieldName as CompositeFieldSubFieldName)
            : (groupBySubFieldNameY as CompositeFieldSubFieldName | undefined),
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
          ? capitalize(configuration.color as string)
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

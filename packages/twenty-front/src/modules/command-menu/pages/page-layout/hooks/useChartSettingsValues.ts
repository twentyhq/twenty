import { useGraphSortOptions } from '@/command-menu/pages/page-layout/hooks/useGraphSortOptions';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { getChartAxisNameDisplayOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameDisplayOptions';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';

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

  const graphSortOptions = useGraphSortOptions({
    objectMetadataId,
    configuration,
  });

  if (!configuration) {
    return {
      getChartSettingsValues: () => undefined,
    };
  }

  const groupByFieldX =
    'groupByFieldMetadataIdX' in configuration
      ? objectMetadataItem?.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
        )
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
      : undefined;

  const xAxisOrderBy =
    'orderByX' in configuration ? configuration.orderByX : undefined;

  const xAxisOrderByLabel = graphSortOptions.sortOptions.find(
    (option) => option.value === xAxisOrderBy,
  )?.label;

  const getChartSettingsValues = (
    itemId: string,
  ): boolean | string | undefined => {
    switch (itemId) {
      case 'source':
        return objectMetadataItem?.labelPlural;
      case 'data-on-display-x':
        return groupByFieldX?.label;
      case 'colors':
        return 'color' in configuration
          ? capitalize(configuration.color ?? '')
          : undefined;
      case 'data-on-display-y':
        return `${aggregateField?.label ?? ''}${aggregateField?.label ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})` : ''}`;
      case 'group-by-y':
        return groupByFieldY?.label;
      case 'axis-name':
        return 'axisNameDisplay' in configuration
          ? getChartAxisNameDisplayOptions(configuration.axisNameDisplay)
          : undefined;
      case 'sort-by-x':
        return xAxisOrderByLabel;
      case 'data-labels':
        return configuration.displayDataLabel;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};

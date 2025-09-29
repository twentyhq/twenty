import { useGraphSortOptions } from '@/command-menu/pages/page-layout/hooks/useGraphSortOptions';
import { getChartAxisNameOptions } from '@/command-menu/pages/page-layout/utils/getChartAxisNameOptions';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated/graphql';

export const useChartSettingsValues = (
  configuration: PageLayoutWidget['configuration'],
) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === configuration.source,
  );

  const groupByFieldX = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
  );

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.aggregateFieldMetadataId,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const groupByFieldY = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.groupByFieldMetadataIdY,
  );

  const xAxisOrderBy = configuration.orderByX;

  const graphSortOptions = useGraphSortOptions(configuration);

  const xAxisOrderByLabel = graphSortOptions.sortOptions.find(
    (option) => option.value === xAxisOrderBy,
  )?.label;

  const getChartSettingsValues = (itemId: string) => {
    switch (itemId) {
      case 'source':
        return objectMetadataItem?.labelPlural;
      case 'data-on-display-x':
        return groupByFieldX?.label;
      case 'colors':
        return capitalize(configuration.color);
      case 'data-on-display-y':
        return `${aggregateField?.label ?? ''}${aggregateField?.label ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})` : ''}`;
      case 'group-by-y':
        return groupByFieldY?.label;
      case 'axis-name':
        return getChartAxisNameOptions(configuration.axisNameDisplay);
      case 'sort-by-x':
        return xAxisOrderByLabel;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};

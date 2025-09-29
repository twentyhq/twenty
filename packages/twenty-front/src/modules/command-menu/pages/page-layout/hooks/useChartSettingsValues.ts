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

  const groupByFieldMetadataIdX = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.groupByFieldMetadataIdX,
  );

  const groupByFieldMetadataIdY = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration.groupByFieldMetadataIdY,
  );

  const yAxisAggregateOperation = configuration.aggregateOperation;

  const getChartSettingsValues = (itemId: string) => {
    switch (itemId) {
      case 'source':
        return objectMetadataItem?.labelPlural;
      case 'data-on-display-x':
        return (
          groupByFieldMetadataIdX?.label ||
          configuration.groupByFieldMetadataIdX
        );
      case 'colors':
        return capitalize(configuration.color);
      case 'data-on-display-y':
        return `${groupByFieldMetadataIdY?.label ?? ''}${yAxisAggregateOperation ? ` (${getAggregateOperationLabel(yAxisAggregateOperation)})` : ''}`;
      default:
        return '';
    }
  };

  return {
    getChartSettingsValues,
  };
};

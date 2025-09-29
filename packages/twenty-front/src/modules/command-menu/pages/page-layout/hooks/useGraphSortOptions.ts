import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import {
  IconArrowDown,
  IconArrowUp,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';
import { type PageLayoutWidget } from '~/generated/graphql';

export type SortOption =
  | 'FIELD_ASC'
  | 'FIELD_DESC'
  | 'VALUE_ASC'
  | 'VALUE_DESC';

export type SortOptionItem = {
  value: SortOption;
  label: string;
  icon: typeof IconArrowUp;
};

export const useGraphSortOptions = (
  configuration: PageLayoutWidget['configuration'],
) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === configuration?.source,
  );

  const groupByFieldX = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration?.groupByFieldMetadataIdX,
  );

  const aggregateField = objectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === configuration?.aggregateFieldMetadataId,
  );

  const aggregateOperation = configuration?.aggregateOperation;

  const getSortOptions = (): SortOptionItem[] => {
    const fieldLabel = groupByFieldX?.label || 'Field';
    const valueLabel =
      aggregateField?.label && aggregateOperation
        ? getAggregateOperationLabel(aggregateOperation)
        : 'Value';

    return [
      {
        value: 'FIELD_ASC',
        label: `${fieldLabel} Ascending`,
        icon: IconArrowUp,
      },
      {
        value: 'FIELD_DESC',
        label: `${fieldLabel} Descending`,
        icon: IconArrowDown,
      },
      {
        value: 'VALUE_ASC',
        label: `${valueLabel} Ascending`,
        icon: IconTrendingUp,
      },
      {
        value: 'VALUE_DESC',
        label: `${valueLabel} Descending`,
        icon: IconTrendingDown,
      },
    ];
  };

  return {
    sortOptions: getSortOptions(),
  };
};

import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconTrendingDown,
  IconTrendingUp,
} from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export type SortOptionItem = {
  value: GraphOrderBy;
  label: string;
  icon: typeof IconArrowUp;
};

export const useGraphSortOptions = ({
  objectMetadataId,
  configuration,
}: {
  objectMetadataId: string;
  configuration?: ChartConfiguration;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (
    !isDefined(configuration) ||
    !('groupByFieldMetadataIdX' in configuration)
  ) {
    return {
      sortOptions: [],
    };
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
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
        value: GraphOrderBy.FIELD_ASC,
        label: `${fieldLabel} Ascending`,
        icon: IconArrowUp,
      },
      {
        value: GraphOrderBy.FIELD_DESC,
        label: `${fieldLabel} Descending`,
        icon: IconArrowDown,
      },
      {
        value: GraphOrderBy.VALUE_ASC,
        label: `${valueLabel} Ascending`,
        icon: IconTrendingUp,
      },
      {
        value: GraphOrderBy.VALUE_DESC,
        label: `${valueLabel} Descending`,
        icon: IconTrendingDown,
      },
    ];
  };

  return {
    sortOptions: getSortOptions(),
  };
};

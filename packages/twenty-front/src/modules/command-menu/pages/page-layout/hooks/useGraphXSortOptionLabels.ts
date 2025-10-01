import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type IconArrowUp } from 'twenty-ui/display';
import {
  type ExtendedAggregateOperations,
  GraphOrderBy,
} from '~/generated/graphql';

export type SortOptionItem = {
  value: GraphOrderBy;
  label: string;
  icon: typeof IconArrowUp;
};

export const useGraphXSortOptionLabels = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
  );

  const getXSortOptionLabel = ({
    graphOrderBy,
    groupByFieldMetadataIdX,
    aggregateFieldMetadataId,
    aggregateOperation,
  }: {
    graphOrderBy: GraphOrderBy;
    groupByFieldMetadataIdX: string;
    aggregateFieldMetadataId?: string;
    aggregateOperation?: ExtendedAggregateOperations;
  }): string => {
    const groupByField = objectMetadataItem?.fields.find(
      (fieldMetadataItem) => fieldMetadataItem.id === groupByFieldMetadataIdX,
    );

    const fieldLabel = groupByField?.label || 'Field';

    const aggregateField = objectMetadataItem?.fields.find(
      (fieldMetadataItem) =>
        isDefined(aggregateFieldMetadataId) &&
        fieldMetadataItem.id === aggregateFieldMetadataId,
    );

    const valueLabel =
      aggregateField?.label && isDefined(aggregateOperation)
        ? getAggregateOperationLabel(aggregateOperation)
        : 'Value';

    switch (graphOrderBy) {
      case GraphOrderBy.FIELD_ASC:
        return `${fieldLabel} Ascending`;
      case GraphOrderBy.FIELD_DESC:
        return `${fieldLabel} Descending`;
      case GraphOrderBy.VALUE_ASC:
        return `${valueLabel} Ascending`;
      case GraphOrderBy.VALUE_DESC:
        return `${valueLabel} Descending`;
    }
  };

  return {
    getXSortOptionLabel,
  };
};

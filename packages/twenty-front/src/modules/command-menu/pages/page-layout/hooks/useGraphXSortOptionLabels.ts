import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import {
  type ExtendedAggregateOperations,
  GraphOrderBy,
} from '~/generated/graphql';

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

    const fieldLabel = groupByField?.label || t`Field`;

    const aggregateField = objectMetadataItem?.fields.find(
      (fieldMetadataItem) =>
        isDefined(aggregateFieldMetadataId) &&
        fieldMetadataItem.id === aggregateFieldMetadataId,
    );

    const valueLabel =
      aggregateField?.label && isDefined(aggregateOperation)
        ? getAggregateOperationLabel(aggregateOperation)
        : t`Value`;

    switch (graphOrderBy) {
      case GraphOrderBy.FIELD_ASC:
        return `${fieldLabel} ${t`Ascending`}`;
      case GraphOrderBy.FIELD_DESC:
        return `${fieldLabel} ${t`Descending`}`;
      case GraphOrderBy.VALUE_ASC:
        return `${valueLabel} ${t`Ascending`}`;
      case GraphOrderBy.VALUE_DESC:
        return `${valueLabel} ${t`Descending`}`;
      default:
        assertUnreachable(graphOrderBy);
    }
  };

  return {
    getXSortOptionLabel,
  };
};

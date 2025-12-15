import { getFieldLabelWithSubField } from '@/command-menu/pages/page-layout/utils/getFieldLabelWithSubField';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

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
    groupBySubFieldNameX,
    aggregateFieldMetadataId,
    aggregateOperation,
  }: {
    graphOrderBy: GraphOrderBy;
    groupByFieldMetadataIdX: string;
    groupBySubFieldNameX?: CompositeFieldSubFieldName;
    aggregateFieldMetadataId?: string;
    aggregateOperation?: ExtendedAggregateOperations;
  }): string => {
    const groupByField = objectMetadataItem?.fields.find(
      (fieldMetadataItem) => fieldMetadataItem.id === groupByFieldMetadataIdX,
    );

    const fieldLabel = getFieldLabelWithSubField({
      field: groupByField,
      subFieldName: groupBySubFieldNameX,
      objectMetadataItems,
    });

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
        return `${fieldLabel} ${t`A → Z`}`;
      case GraphOrderBy.FIELD_DESC:
        return `${fieldLabel} ${t`Z → A`}`;
      case GraphOrderBy.FIELD_POSITION_ASC:
        return `${fieldLabel} ${t`Position Ascending`}`;
      case GraphOrderBy.FIELD_POSITION_DESC:
        return `${fieldLabel} ${t`Position Descending`}`;
      case GraphOrderBy.VALUE_ASC:
        return `${valueLabel} ${t`Ascending`}`;
      case GraphOrderBy.VALUE_DESC:
        return `${valueLabel} ${t`Descending`}`;
      case GraphOrderBy.MANUAL:
        return t`Manual`;
      default:
        assertUnreachable(graphOrderBy);
    }
  };

  return {
    getXSortOptionLabel,
  };
};

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { KanbanAggregateOperation } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import isEmpty from 'lodash.isempty';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const computeAggregateValueAndLabel = (
  data: AggregateRecordsData,
  objectMetadataItem: ObjectMetadataItem,
  recordIndexKanbanAggregateOperation: KanbanAggregateOperation,
  kanbanFieldName: string,
) => {
  if (isEmpty(data)) {
    return {};
  }
  const kanbanAggregateOperationField = objectMetadataItem.fields?.find(
    (field) =>
      field.id === recordIndexKanbanAggregateOperation?.fieldMetadataId,
  );

  const kanbanAggregateOperationFieldName = kanbanAggregateOperationField?.name;

  if (
    !isDefined(kanbanAggregateOperationFieldName) ||
    !isDefined(recordIndexKanbanAggregateOperation?.operation)
  ) {
    return {
      value: data?.[kanbanFieldName]?.[AGGREGATE_OPERATIONS.count],
      label: `${getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}`,
    };
  }

  const aggregateValue =
    data[kanbanAggregateOperationFieldName]?.[
      recordIndexKanbanAggregateOperation.operation
    ];

  const value =
    isDefined(aggregateValue) &&
    kanbanAggregateOperationField?.type === FieldMetadataType.Currency
      ? Number(aggregateValue) / 1_000_000
      : aggregateValue;

  return {
    value,
    label: `${getAggregateOperationLabel(recordIndexKanbanAggregateOperation.operation)} of ${kanbanAggregateOperationFieldName}`,
  };
};

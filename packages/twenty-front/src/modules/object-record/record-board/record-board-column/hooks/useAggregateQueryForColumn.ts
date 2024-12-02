import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  AggregateData,
  useAggregate,
} from '@/object-record/hooks/useAggregate';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import {
  KanbanAggregateOperation,
  recordIndexKanbanAggregateOperationState,
} from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import isEmpty from 'lodash.isempty';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useAggregateQueryForColumn = () => {
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );

  const { columnDefinition, recordCount } = useContext(
    RecordBoardColumnContext,
  );

  const { objectMetadataItem } = useContext(RecordBoardContext);

  const recordIndexKanbanAggregateOperation = useRecoilValue(
    recordIndexKanbanAggregateOperationState,
  );

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const kanbanFieldName = objectMetadataItem.fields?.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  )?.name;

  if (!isDefined(kanbanFieldName)) {
    throw new Error(
      `Field name is not found for field with id ${recordIndexKanbanFieldMetadataId} on object ${objectMetadataItem.nameSingular}`,
    );
  }

  const recordGqlFieldsAggregate = buildRecordGqlFieldsAggregate({
    objectMetadataItem: objectMetadataItem,
    recordIndexKanbanAggregateOperation: recordIndexKanbanAggregateOperation,
    kanbanFieldName: kanbanFieldName,
  });

  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const requestFilters = computeViewRecordGqlOperationFilter(
    recordIndexFilters,
    objectMetadataItem.fields,
    recordIndexViewFilterGroups,
  );

  const filter = {
    ...requestFilters,
    [kanbanFieldName]:
      columnDefinition.value === null
        ? { is: 'NULL' }
        : { eq: columnDefinition.value },
  };

  const { data } = useAggregate({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter,
    skip: !isAggregateQueryEnabled,
  });

  const { value, label } = computeAggregateValueAndLabel(
    data,
    objectMetadataItem,
    recordIndexKanbanAggregateOperation,
    kanbanFieldName,
  );

  return {
    aggregateValue: value ?? recordCount,
    aggregateLabel: isDefined(value) ? label : undefined,
  };
};

const buildRecordGqlFieldsAggregate = ({
  objectMetadataItem,
  recordIndexKanbanAggregateOperation,
  kanbanFieldName,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordIndexKanbanAggregateOperation: KanbanAggregateOperation;
  kanbanFieldName: string;
}) => {
  let recordGqlFieldsAggregate = {};

  const kanbanAggregateOperationFieldName = objectMetadataItem.fields?.find(
    (field) =>
      field.id === recordIndexKanbanAggregateOperation?.fieldMetadataId,
  )?.name;

  if (!kanbanAggregateOperationFieldName) {
    if (
      isDefined(recordIndexKanbanAggregateOperation?.operation) &&
      recordIndexKanbanAggregateOperation.operation !==
        AGGREGATE_OPERATIONS.count
    ) {
      throw new Error(
        `No field found to compute aggregate operation ${recordIndexKanbanAggregateOperation.operation} on object ${objectMetadataItem.nameSingular}`,
      );
    } else {
      recordGqlFieldsAggregate = {
        [kanbanFieldName]: AGGREGATE_OPERATIONS.count,
      };
    }
  } else {
    recordGqlFieldsAggregate = {
      [kanbanAggregateOperationFieldName]:
        recordIndexKanbanAggregateOperation?.operation ??
        AGGREGATE_OPERATIONS.count,
    };
  }

  return recordGqlFieldsAggregate;
};

const computeAggregateValueAndLabel = (
  data: AggregateData,
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

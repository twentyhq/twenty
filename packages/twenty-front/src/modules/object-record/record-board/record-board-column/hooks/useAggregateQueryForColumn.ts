import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregate } from '@/object-record/hooks/useAggregate';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import {
  KanbanAggregateOperation,
  recordIndexKanbanAggregateOperationState,
} from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
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

  const recordGqlFieldsAggregate = builRecordGqlFieldsAggregate({
    objectMetadataItem: objectMetadataItem,
    recordIndexKanbanAggregateOperation: recordIndexKanbanAggregateOperation,
    kanbanFieldName: kanbanFieldName,
  });

  const { data } = useAggregate({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: {
      [kanbanFieldName]: { eq: columnDefinition.value },
    },
    skip: !isAggregateQueryEnabled,
  });

  const aggregate = Object.values(
    data?.[objectMetadataItem.namePlural] ?? {},
  )?.[1];

  return { aggregateValue: aggregate ?? recordCount };
};

const builRecordGqlFieldsAggregate = ({
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

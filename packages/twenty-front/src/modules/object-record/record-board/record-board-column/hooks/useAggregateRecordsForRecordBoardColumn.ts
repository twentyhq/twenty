import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { buildRecordGqlFieldsAggregateForRecordBoard } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForRecordBoard';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useAggregateRecordsForRecordBoardColumn = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

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

  const recordGqlFieldsAggregate = buildRecordGqlFieldsAggregateForRecordBoard({
    objectMetadataItem: objectMetadataItem,
    recordIndexKanbanAggregateOperation: recordIndexKanbanAggregateOperation,
    kanbanFieldName: kanbanFieldName,
  });

  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeViewRecordGqlOperationFilter(
    filterValueDependencies,
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

  const { data } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter,
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const { value, labelWithFieldName } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: recordIndexKanbanAggregateOperation?.fieldMetadataId,
    aggregateOperation: recordIndexKanbanAggregateOperation?.operation,
    fallbackFieldName: kanbanFieldName,
    dateFormat,
    timeFormat,
    timeZone,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? labelWithFieldName : undefined,
  };
};

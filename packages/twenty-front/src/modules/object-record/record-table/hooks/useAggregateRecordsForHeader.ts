import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { buildRecordGqlFieldsAggregateForView } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForView';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

type UseAggregateRecordsProps = {
  objectMetadataItem: ObjectMetadataItem;
  additionalFilters?: Record<string, unknown>;
  fallbackFieldName: string;
};

export const useAggregateRecordsForHeader = ({
  objectMetadataItem,
  additionalFilters = {},
}: UseAggregateRecordsProps) => {
  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);

  const recordIndexKanbanAggregateOperation = useRecoilValue(
    recordIndexKanbanAggregateOperationState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const requestFilters = computeViewRecordGqlOperationFilter(
    filterValueDependencies,
    recordIndexFilters,
    objectMetadataItem.fields,
    recordIndexViewFilterGroups,
  );

  const recordGqlFieldsAggregate = buildRecordGqlFieldsAggregateForView({
    objectMetadataItem,
    recordIndexKanbanAggregateOperation,
  });

  const { data } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters, ...additionalFilters },
  });

  const { value, labelWithFieldName } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: recordIndexKanbanAggregateOperation?.fieldMetadataId,
    aggregateOperation: recordIndexKanbanAggregateOperation?.operation,
    dateFormat,
    timeFormat,
    timeZone,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? labelWithFieldName : undefined,
  };
};

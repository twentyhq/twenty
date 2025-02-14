import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared';

export const useAggregateRecordsForRecordTableColumnFooter = (
  fieldMetadataId: string,
) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { recordGroupFilter } = useRecordGroupFilter(objectMetadataItem.fields);

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

  const { viewFieldId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  // TODO: This shouldn't be set with impossible values,
  // see problem with view id not being set early enoughby Effect component in context store,
  // This happens here when switching from a view to another.
  const aggregateOperationForViewFieldWithProbableImpossibleValues =
    useRecoilValue(viewFieldAggregateOperationState({ viewFieldId }));

  const isAggregateOperationImpossibleForDateField =
    isDefined(fieldMetadataItem) &&
    isFieldMetadataDateKind(fieldMetadataItem.type) &&
    isDefined(aggregateOperationForViewFieldWithProbableImpossibleValues) &&
    (aggregateOperationForViewFieldWithProbableImpossibleValues ===
      AGGREGATE_OPERATIONS.min ||
      aggregateOperationForViewFieldWithProbableImpossibleValues ===
        AGGREGATE_OPERATIONS.max);

  const aggregateOperationForViewField:
    | ExtendedAggregateOperations
    | undefined
    | null = isAggregateOperationImpossibleForDateField
    ? convertAggregateOperationToExtendedAggregateOperation(
        aggregateOperationForViewFieldWithProbableImpossibleValues,
        fieldMetadataItem.type,
      )
    : aggregateOperationForViewFieldWithProbableImpossibleValues;

  const fieldName = fieldMetadataItem?.name;

  const recordGqlFieldsAggregate =
    isDefined(aggregateOperationForViewField) && isDefined(fieldName)
      ? {
          [fieldName]: [aggregateOperationForViewField],
        }
      : {};

  const { data, loading } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters, ...recordGroupFilter },
    skip: !isDefined(aggregateOperationForViewField),
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const { value, label } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: fieldMetadataId,
    aggregateOperation: aggregateOperationForViewField,
    dateFormat,
    timeFormat,
    timeZone,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? label : undefined,
    isLoading: loading,
  };
};

import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useAggregateRecordsForRecordTableColumnFooter = (
  fieldMetadataId: string,
) => {
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );
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
  const aggregateOperationForViewField = useRecoilValue(
    viewFieldAggregateOperationState({ viewFieldId }),
  );

  const fieldName = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  )?.name;

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
    skip:
      !isAggregateQueryEnabled || !isDefined(aggregateOperationForViewField),
  });

  const { value, label } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: fieldMetadataId,
    aggregateOperation: aggregateOperationForViewField,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? label : undefined,
    isLoading: loading,
  };
};

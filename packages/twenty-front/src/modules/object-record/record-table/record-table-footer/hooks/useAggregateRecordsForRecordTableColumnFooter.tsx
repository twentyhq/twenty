import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { aggregateOperationForViewFieldState } from '@/object-record/record-table/record-table-footer/states/aggregateOperationForViewFieldState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useAggregateRecordsForRecordTableColumnFooter = (
  fieldMetadataId: string,
) => {
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );

  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { currentViewWithSavedFiltersAndSorts } = useGetCurrentView();
  const recordIndexViewFilterGroups = useRecoilValue(
    recordIndexViewFilterGroupsState,
  );

  const recordIndexFilters = useRecoilValue(recordIndexFiltersState);
  const requestFilters = computeViewRecordGqlOperationFilter(
    recordIndexFilters,
    objectMetadataItem.fields,
    recordIndexViewFilterGroups,
  );

  const viewFieldId = currentViewWithSavedFiltersAndSorts?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  )?.id;

  if (!viewFieldId) {
    throw new Error('ViewField not found');
  }

  const aggregateOperationForViewField = useRecoilValue(
    aggregateOperationForViewFieldState({ viewFieldId: viewFieldId }),
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

  const { data } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters },
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
  };
};

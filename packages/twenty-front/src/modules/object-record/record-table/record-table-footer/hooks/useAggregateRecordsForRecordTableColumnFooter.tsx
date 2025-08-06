import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/object-record/record-filter/utils/turnAnyFieldFilterIntoRecordGqlFilter';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useAggregateRecordsForRecordTableColumnFooter = (
  fieldMetadataId: string,
) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { recordGroupFilter } = useRecordGroupFilter(objectMetadataItem.fields);

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const dateLocale = useRecoilValue(dateLocaleState);

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    fields: objectMetadataItem.fields,
    filterValueDependencies,
    recordFilterGroups: currentRecordFilterGroups,
    recordFilters: currentRecordFilters,
  });

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
      AggregateOperations.MIN ||
      aggregateOperationForViewFieldWithProbableImpossibleValues ===
        AggregateOperations.MAX);

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

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      objectMetadataItem,
      filterValue: anyFieldFilterValue,
    });

  const { data, loading } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters, ...recordGroupFilter, ...anyFieldFilter },
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
    localeCatalog: dateLocale.localeCatalog,
  });

  return {
    aggregateValue: value,
    aggregateLabel: isDefined(value) ? label : undefined,
    isLoading: loading,
  };
};

import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';

import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { getRecordAggregateDisplayLabel } from '@/object-record/record-index/utils/getRecordndexAggregateDisplayLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import {
  computeRecordGqlOperationFilter,
  findById,
  isDefined,
  isFieldMetadataDateKind,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useAggregateRecordsForRecordTableColumnFooter = (
  aggregateFieldMetadataId: string,
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
    (field) => field.id === aggregateFieldMetadataId,
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
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const { data, loading } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: { ...requestFilters, ...recordGroupFilter, ...anyFieldFilter },
    skip: !isDefined(aggregateOperationForViewField),
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const aggregateFieldMetadataItem = objectMetadataItem.fields.find(
    findById(aggregateFieldMetadataId),
  );

  if (!isDefined(aggregateFieldMetadataItem)) {
    return {
      aggregateValue:
        data?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
          AggregateOperations.COUNT
        ],
      aggregateLabel: getAggregateOperationLabel(AggregateOperations.COUNT),
      isLoading: loading,
    };
  }

  if (!isDefined(aggregateOperationForViewField)) {
    return {
      aggregateValue: null,
      aggregateLabel: null,
      isLoading: loading,
    };
  }

  const aggregateRawValue =
    data[aggregateFieldMetadataItem.name]?.[aggregateOperationForViewField];

  const aggregateDisplayValue =
    transformAggregateRawValueIntoAggregateDisplayValue({
      aggregateFieldMetadataItem: aggregateFieldMetadataItem,
      aggregateOperation: aggregateOperationForViewField,
      aggregateRawValue: aggregateRawValue,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
      timeFormat,
      timeZone,
    });

  const { aggregateLabel } = getRecordAggregateDisplayLabel({
    aggregateFieldMetadataItem,
    aggregateOperation: aggregateOperationForViewField,
  });

  return {
    aggregateValue: aggregateDisplayValue,
    aggregateLabel: isDefined(aggregateDisplayValue)
      ? aggregateLabel
      : undefined,
    isLoading: loading,
  };
};

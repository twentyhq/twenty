import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { buildAggregateFieldPath } from '@/object-record/utils/splitAggregateFieldPath';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  isFieldMetadataDateKind,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';
import { dateLocaleState } from '@/localization/states/dateLocaleState';

export const useAggregateRecordsForRecordTableColumnFooter = () => {
  const { objectMetadataItem, visibleRecordFields } =
    useRecordTableContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { recordGroupFilter } = useRecordGroupFilter(objectMetadataItem.fields);

  const { numberFormat, formatNumber } = useNumberFormat();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const dateLocale = useAtomStateValue(dateLocaleState);

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
    recordFilterGroups: currentRecordFilterGroups,
    recordFilters: currentRecordFilters,
  });

  const { viewFieldId, recordFieldKey, fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  const recordField = visibleRecordFields.find(
    (visibleRecordField) =>
      getRecordFieldKey(visibleRecordField) === recordFieldKey,
  );

  // A column through a relation aggregates the target field of the related object.
  const relationTraversal = isDefined(recordField)
    ? resolveRecordFieldRelationTraversal({
        recordField,
        sourceObjectMetadataItem: objectMetadataItem,
        objectMetadataItems,
      })
    : null;

  const fieldMetadataItem =
    relationTraversal?.targetFieldMetadataItem ??
    objectMetadataItem.fields.find((field) => field.id === fieldMetadataId);

  const aggregateFieldPath = isDefined(relationTraversal)
    ? buildAggregateFieldPath({
        relationFieldName: relationTraversal.relationFieldMetadataItem.name,
        targetFieldName: relationTraversal.targetFieldMetadataItem.name,
      })
    : fieldMetadataItem?.name;

  // TODO: This shouldn't be set with impossible values,
  // see problem with view id not being set early enoughby Effect component in context store,
  // This happens here when switching from a view to another.
  const viewFieldAggregateOperation = useAtomFamilyStateValue(
    viewFieldAggregateOperationState,
    { viewFieldId },
  );

  const isAggregateOperationImpossibleForDateField =
    isDefined(fieldMetadataItem) &&
    isFieldMetadataDateKind(fieldMetadataItem.type) &&
    isDefined(viewFieldAggregateOperation) &&
    (viewFieldAggregateOperation === AggregateOperations.MIN ||
      viewFieldAggregateOperation === AggregateOperations.MAX);

  const aggregateOperationForViewField:
    | ExtendedAggregateOperations
    | undefined
    | null = isAggregateOperationImpossibleForDateField
    ? convertAggregateOperationToExtendedAggregateOperation(
        viewFieldAggregateOperation,
        fieldMetadataItem.type,
      )
    : viewFieldAggregateOperation;

  const recordGqlFieldsAggregate =
    isDefined(aggregateOperationForViewField) && isDefined(aggregateFieldPath)
      ? {
          [aggregateFieldPath]: [aggregateOperationForViewField],
        }
      : {};

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.readableFields,
      filterValue: anyFieldFilterValue,
    });

  const { data, loading } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: {
      ...requestFilters,
      ...recordGroupFilter,
      ...anyFieldFilter,
    },
    skip: !isDefined(aggregateOperationForViewField),
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const aggregateFieldMetadataItem = fieldMetadataItem;

  if (!isDefined(aggregateFieldMetadataItem) || !isDefined(aggregateFieldPath)) {
    const totalCountAggregateValue =
      data?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
        AggregateOperations.COUNT
      ];

    return {
      aggregateValue: isDefined(totalCountAggregateValue)
        ? formatNumber(Number(totalCountAggregateValue))
        : totalCountAggregateValue,
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
    data[aggregateFieldPath]?.[aggregateOperationForViewField];

  const aggregateDisplayValue =
    transformAggregateRawValueIntoAggregateDisplayValue({
      aggregateFieldMetadataItem: aggregateFieldMetadataItem,
      aggregateOperation: aggregateOperationForViewField,
      aggregateRawValue: aggregateRawValue,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
      timeFormat,
      timeZone,
      numberFormat,
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

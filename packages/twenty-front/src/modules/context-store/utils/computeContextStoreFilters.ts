import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import {
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  computeRecordGqlOperationFilter,
  isEmptyObject,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

type ComputeContextStoreFiltersProps = {
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule;
  contextStoreFilters: RecordFilter[];
  contextStoreFilterGroups: RecordFilterGroup[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
  contextStoreAnyFieldFilterValue: string;
  currentViewPresetFilterAsRecordGqlOperationFilter: RecordGqlOperationFilter;
};

export const computeContextStoreFilters = ({
  contextStoreTargetedRecordsRule,
  contextStoreFilters,
  contextStoreFilterGroups,
  objectMetadataItem,
  fieldMetadataItems,
  filterValueDependencies,
  contextStoreAnyFieldFilterValue,
  currentViewPresetFilterAsRecordGqlOperationFilter,
}: ComputeContextStoreFiltersProps) => {
  let queryFilter: RecordGqlOperationFilter | undefined;

  const { recordGqlOperationFilter: recordGqlFilterForAnyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      filterValue: contextStoreAnyFieldFilterValue,
      fields: objectMetadataItem.readableFields,
    });

  if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
    queryFilter = makeAndFilterVariables([
      recordGqlFilterForAnyFieldFilter,
      computeRecordGqlOperationFilter({
        filterValueDependencies,
        fieldMetadataItems,
        recordFilters: contextStoreFilters,
        recordFilterGroups: contextStoreFilterGroups,
      }),
      isEmptyObject(currentViewPresetFilterAsRecordGqlOperationFilter)
        ? undefined
        : currentViewPresetFilterAsRecordGqlOperationFilter,
      contextStoreTargetedRecordsRule.excludedRecordIds.length > 0
        ? {
            not: {
              id: {
                in: contextStoreTargetedRecordsRule.excludedRecordIds,
              },
            },
          }
        : undefined,
    ]);
  }
  if (contextStoreTargetedRecordsRule.mode === 'selection') {
    return {
      id: {
        in: contextStoreTargetedRecordsRule.selectedRecordIds,
      },
    };
  }

  return queryFilter;
};

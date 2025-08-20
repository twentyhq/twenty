import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/object-record/record-filter/utils/turnAnyFieldFilterIntoRecordGqlFilter';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';

type ComputeContextStoreFiltersProps = {
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule;
  contextStoreFilters: RecordFilter[];
  contextStoreFilterGroups: RecordFilterGroup[];
  objectMetadataItem: ObjectMetadataItem;
  filterValueDependencies: RecordFilterValueDependencies;
  contextStoreAnyFieldFilterValue: string;
};

export const computeContextStoreFilters = ({
  contextStoreTargetedRecordsRule,
  contextStoreFilters,
  contextStoreFilterGroups,
  objectMetadataItem,
  filterValueDependencies,
  contextStoreAnyFieldFilterValue,
}: ComputeContextStoreFiltersProps) => {
  let queryFilter: RecordGqlOperationFilter | undefined;

  const { recordGqlOperationFilter: recordGqlFilterForAnyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      filterValue: contextStoreAnyFieldFilterValue,
      objectMetadataItem,
    });

  if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
    queryFilter = makeAndFilterVariables([
      recordGqlFilterForAnyFieldFilter,
      computeRecordGqlOperationFilter({
        filterValueDependencies,
        fields: objectMetadataItem?.fields ?? [],
        recordFilters: contextStoreFilters,
        recordFilterGroups: contextStoreFilterGroups,
      }),
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
    queryFilter = makeAndFilterVariables([
      recordGqlFilterForAnyFieldFilter,
      contextStoreTargetedRecordsRule.selectedRecordIds.length > 0
        ? {
            id: {
              in: contextStoreTargetedRecordsRule.selectedRecordIds,
            },
          }
        : undefined,
      computeRecordGqlOperationFilter({
        filterValueDependencies,
        fields: objectMetadataItem?.fields ?? [],
        recordFilters: contextStoreFilters,
        recordFilterGroups: contextStoreFilterGroups,
      }),
    ]);
  }

  return queryFilter;
};

import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterValueDependencies } from '@/object-record/record-filter/types/FilterValueDependencies';
import { computeViewRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';

export const computeContextStoreFilters = (
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule,
  contextStoreFilters: Filter[],
  objectMetadataItem: ObjectMetadataItem,
  filterValueDependencies: FilterValueDependencies,
) => {
  let queryFilter: RecordGqlOperationFilter | undefined;

  if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
    queryFilter = makeAndFilterVariables([
      computeViewRecordGqlOperationFilter(
        filterValueDependencies,
        contextStoreFilters,
        objectMetadataItem?.fields ?? [],
        [],
      ),
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
    queryFilter =
      contextStoreTargetedRecordsRule.selectedRecordIds.length > 0
        ? {
            id: {
              in: contextStoreTargetedRecordsRule.selectedRecordIds,
            },
          }
        : computeViewRecordGqlOperationFilter(
            filterValueDependencies,
            contextStoreFilters,
            objectMetadataItem?.fields ?? [],
            [],
          );
  }

  return queryFilter;
};

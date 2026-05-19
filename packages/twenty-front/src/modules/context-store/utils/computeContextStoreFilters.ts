import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import {
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  hydrateRecordFilters,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

type ComputeContextStoreFiltersProps = {
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule;
  contextStoreFilters: RecordFilter[];
  contextStoreFilterGroups: RecordFilterGroup[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItemByIdMap: ReadonlyMap<string, FieldMetadataItem>;
  filterValueDependencies: RecordFilterValueDependencies;
  contextStoreAnyFieldFilterValue: string;
};

export const computeContextStoreFilters = ({
  contextStoreTargetedRecordsRule,
  contextStoreFilters,
  contextStoreFilterGroups,
  objectMetadataItem,
  fieldMetadataItemByIdMap,
  filterValueDependencies,
  contextStoreAnyFieldFilterValue,
}: ComputeContextStoreFiltersProps) => {
  let queryFilter: RecordGqlOperationFilter | undefined;

  const { recordGqlOperationFilter: recordGqlFilterForAnyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      filterValue: contextStoreAnyFieldFilterValue,
      fields: objectMetadataItem.fields,
    });

  const hydratedContextStoreFilters = hydrateRecordFilters(
    contextStoreFilters,
    (id) => fieldMetadataItemByIdMap.get(id),
  );

  if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
    queryFilter = makeAndFilterVariables([
      recordGqlFilterForAnyFieldFilter,
      computeRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilters: hydratedContextStoreFilters,
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
    if (contextStoreTargetedRecordsRule.selectedRecordIds.length === 0) {
      return { id: { in: [] } };
    }

    queryFilter = makeAndFilterVariables([
      recordGqlFilterForAnyFieldFilter,
      {
        id: {
          in: contextStoreTargetedRecordsRule.selectedRecordIds,
        },
      },
      computeRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilters: hydratedContextStoreFilters,
        recordFilterGroups: contextStoreFilterGroups,
      }),
    ]);
  }

  return queryFilter;
};

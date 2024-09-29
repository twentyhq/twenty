import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { queryBuilderConfig } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownAdvancedInput';
import { ImmutableTree } from '@react-awesome-query-builder/core';

export const advancedFilterToQueryFilter = (
  tree: ImmutableTree,
): RecordGqlOperationFilter => {
  const config = queryBuilderConfig;

  /* TODO: Construct query based on
  react-awesome-query-builder/core/src/modules/export/jsonLogic.js
  using turnObjectDropdownFilterIntoQueryFilter
   */

  throw new Error('Not implemented');
};

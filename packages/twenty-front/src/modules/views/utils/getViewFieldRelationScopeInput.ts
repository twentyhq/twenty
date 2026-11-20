import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFieldRelationScopeInput } from '~/generated-metadata/graphql';

// A scope read from the API carries __typename on every level, which the input type rejects
export const getViewFieldRelationScopeInput = (
  relationScope: ViewFieldRelationScope | null | undefined,
): ViewFieldRelationScopeInput | null | undefined => {
  if (!isDefined(relationScope)) {
    return relationScope;
  }

  return {
    filters: relationScope.filters.map((filter) => ({
      id: filter.id,
      fieldMetadataId: filter.fieldMetadataId,
      operand: filter.operand,
      value: filter.value,
      subFieldName: filter.subFieldName,
      relationTargetFieldMetadataId: filter.relationTargetFieldMetadataId,
      filterGroupId: filter.filterGroupId,
    })),
    filterGroups: relationScope.filterGroups.map((filterGroup) => ({
      id: filterGroup.id,
      parentFilterGroupId: filterGroup.parentFilterGroupId,
      logicalOperator: filterGroup.logicalOperator,
    })),
    sorts: relationScope.sorts.map((sort) => ({
      fieldMetadataId: sort.fieldMetadataId,
      direction: sort.direction,
      subFieldName: sort.subFieldName,
      relationTargetFieldMetadataId: sort.relationTargetFieldMetadataId,
    })),
    limit: relationScope.limit,
  };
};

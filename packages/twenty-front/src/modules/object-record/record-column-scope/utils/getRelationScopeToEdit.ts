import { type ScopedRelationJunctionTargetField } from '@/object-record/record-column-scope/types/ScopedRelationJunctionTargetField';
import { getJunctionTargetFieldReference } from '@/object-record/record-column-scope/utils/getJunctionTargetFieldReference';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRelationScopeToEdit = ({
  relationScope,
  scopedRelationJunction,
}: {
  relationScope: ViewFieldRelationScope;
  scopedRelationJunction: ScopedRelationJunctionTargetField | undefined;
}): ViewFieldRelationScope => {
  if (!isDefined(scopedRelationJunction)) {
    return relationScope;
  }

  return {
    ...relationScope,
    filters: relationScope.filters
      .map((filter) =>
        getJunctionTargetFieldReference({
          fieldReference: filter,
          scopedRelationJunction,
        }),
      )
      .filter(isDefined),
    sorts: relationScope.sorts
      .map((sort) =>
        getJunctionTargetFieldReference({
          fieldReference: sort,
          scopedRelationJunction,
        }),
      )
      .filter(isDefined),
  };
};

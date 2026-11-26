import { type RelationScopeFieldReference } from '@/object-record/record-column-scope/types/RelationScopeFieldReference';
import { type ScopedRelationJunctionTargetField } from '@/object-record/record-column-scope/types/ScopedRelationJunctionTargetField';
import { getJunctionTargetFieldReference } from '@/object-record/record-column-scope/utils/getJunctionTargetFieldReference';
import {
  type ViewFieldRelationScope,
  type ViewFieldRelationScopeFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The editor only lists what is on the target records, so what the scope stores on the join records keeps its rank
const mergeWithStoredJoinObjectFieldReferences = <
  TFieldReference extends RelationScopeFieldReference,
>({
  editedFieldReferences,
  storedFieldReferences,
  scopedRelationJunction,
}: {
  editedFieldReferences: TFieldReference[];
  storedFieldReferences: TFieldReference[];
  scopedRelationJunction: ScopedRelationJunctionTargetField;
}): TFieldReference[] =>
  storedFieldReferences.reduce<TFieldReference[]>(
    (mergedFieldReferences, storedFieldReference, storedRank) => {
      const isOnTargetRecords = isDefined(
        getJunctionTargetFieldReference({
          fieldReference: storedFieldReference,
          scopedRelationJunction,
        }),
      );

      if (isOnTargetRecords) {
        return mergedFieldReferences;
      }

      return mergedFieldReferences.toSpliced(
        storedRank,
        0,
        storedFieldReference,
      );
    },
    editedFieldReferences.map((fieldReference) => ({
      ...fieldReference,
      fieldMetadataId: scopedRelationJunction.targetFieldMetadataItem.id,
      relationTargetFieldMetadataId: fieldReference.fieldMetadataId,
    })),
  );

const ungroupFilterOfRemovedFilterGroup = ({
  filter,
  filterGroups,
}: {
  filter: ViewFieldRelationScopeFilter;
  filterGroups: ViewFieldRelationScope['filterGroups'];
}): ViewFieldRelationScopeFilter => {
  if (
    !isDefined(filter.filterGroupId) ||
    filterGroups.some(({ id }) => id === filter.filterGroupId)
  ) {
    return filter;
  }

  return { ...filter, filterGroupId: null };
};

export const getRelationScopeToSave = ({
  editedRelationScope,
  storedRelationScope,
  scopedRelationJunction,
}: {
  editedRelationScope: ViewFieldRelationScope;
  storedRelationScope: ViewFieldRelationScope | null | undefined;
  scopedRelationJunction: ScopedRelationJunctionTargetField | undefined;
}): ViewFieldRelationScope => {
  if (!isDefined(scopedRelationJunction)) {
    return editedRelationScope;
  }

  return {
    ...editedRelationScope,
    filters: mergeWithStoredJoinObjectFieldReferences({
      editedFieldReferences: editedRelationScope.filters,
      storedFieldReferences: (storedRelationScope?.filters ?? []).map(
        (filter) =>
          ungroupFilterOfRemovedFilterGroup({
            filter,
            filterGroups: editedRelationScope.filterGroups,
          }),
      ),
      scopedRelationJunction,
    }),
    sorts: mergeWithStoredJoinObjectFieldReferences({
      editedFieldReferences: editedRelationScope.sorts,
      storedFieldReferences: storedRelationScope?.sorts ?? [],
      scopedRelationJunction,
    }),
  };
};

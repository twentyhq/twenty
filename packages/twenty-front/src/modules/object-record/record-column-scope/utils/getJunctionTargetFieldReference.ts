import { type RelationScopeFieldReference } from '@/object-record/record-column-scope/types/RelationScopeFieldReference';
import { type ScopedRelationJunctionTargetField } from '@/object-record/record-column-scope/types/ScopedRelationJunctionTargetField';
import { isDefined } from 'twenty-shared/utils';

export const getJunctionTargetFieldReference = <
  TFieldReference extends RelationScopeFieldReference,
>({
  fieldReference,
  scopedRelationJunction,
}: {
  fieldReference: TFieldReference;
  scopedRelationJunction: ScopedRelationJunctionTargetField;
}): TFieldReference | undefined => {
  const { fieldMetadataId, relationTargetFieldMetadataId } = fieldReference;

  if (
    fieldMetadataId !== scopedRelationJunction.targetFieldMetadataItem.id ||
    !isDefined(relationTargetFieldMetadataId)
  ) {
    return undefined;
  }

  return {
    ...fieldReference,
    fieldMetadataId: relationTargetFieldMetadataId,
    relationTargetFieldMetadataId: null,
  };
};

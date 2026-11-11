import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

// Update events list a relation to one record by its join column (companyId), and never a relation to many
export const computeDatabaseEventWatchedFieldName = ({
  name,
  type,
  relationType,
}: {
  name: string;
  type: FieldMetadataType;
  relationType?: RelationType;
}): string | undefined => {
  if (
    type !== FieldMetadataType.RELATION &&
    type !== FieldMetadataType.MORPH_RELATION
  ) {
    return name;
  }

  return relationType === RelationType.MANY_TO_ONE
    ? computeRelationGqlFieldJoinColumnName({ name })
    : undefined;
};

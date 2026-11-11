import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

// Update events list a relation to one record by its join column (companyId); a morph head has none, only its targets do
export const computeDatabaseEventWatchedFieldName = ({
  name,
  type,
  relationType,
  relationTargetObjectUniversalIdentifier,
}: {
  name: string;
  type: FieldMetadataType;
  relationType?: RelationType;
  relationTargetObjectUniversalIdentifier?: string | null;
}): string | undefined => {
  if (
    type !== FieldMetadataType.RELATION &&
    type !== FieldMetadataType.MORPH_RELATION
  ) {
    return name;
  }

  return relationType === RelationType.MANY_TO_ONE &&
    isNonEmptyString(relationTargetObjectUniversalIdentifier)
    ? computeRelationGqlFieldJoinColumnName({ name })
    : undefined;
};

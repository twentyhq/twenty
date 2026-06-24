import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const isManyToOneRelationField = (field: {
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
}): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE;

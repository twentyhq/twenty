import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type FieldWithRelation = {
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
};

export const isManyToOneRelationField = (field: FieldWithRelation): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE;

import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type FieldWithRelation = {
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
};

export const isOneToManyRelationField = <T extends FieldWithRelation>(
  field: T,
): field is T & { relation: NonNullable<T['relation']> } =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.ONE_TO_MANY;

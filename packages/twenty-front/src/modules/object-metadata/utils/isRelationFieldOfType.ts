import {
  FieldMetadataType,
  type RelationType,
} from '~/generated-metadata/graphql';

export type FieldWithRelation = {
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
};

export const isRelationFieldOfType = <T extends FieldWithRelation>(
  field: T,
  relationType: RelationType,
): field is T & { relation: NonNullable<T['relation']> } =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === relationType;

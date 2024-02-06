import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDefinitionRelationType } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const parseFieldRelationType = (
  field: FieldMetadataItem | undefined,
): FieldDefinitionRelationType | undefined => {
  if (!field || field.type !== FieldMetadataType.Relation) return;

  const config: Record<
    RelationMetadataType,
    { from: FieldDefinitionRelationType; to: FieldDefinitionRelationType }
  > = {
    [RelationMetadataType.ManyToMany]: {
      from: 'FROM_MANY_OBJECTS',
      to: 'TO_MANY_OBJECTS',
    },
    [RelationMetadataType.OneToMany]: {
      from: 'FROM_MANY_OBJECTS',
      to: 'TO_ONE_OBJECT',
    },
    [RelationMetadataType.OneToOne]: {
      from: 'FROM_ONE_OBJECT',
      to: 'TO_ONE_OBJECT',
    },
  };

  if (
    isDefined(field.fromRelationMetadata) &&
    field.fromRelationMetadata.relationType in config
  ) {
    return config[field.fromRelationMetadata.relationType].from;
  }

  if (
    isDefined(field.toRelationMetadata) &&
    field.toRelationMetadata.relationType in config
  ) {
    return config[field.toRelationMetadata.relationType].to;
  }

  throw new Error(
    `Cannot determine field relation type for field : ${JSON.stringify(
      field,
    )}.`,
  );
};

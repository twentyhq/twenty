import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { RelationMetadataType } from '~/generated-metadata/graphql';

export const isObjectRecordConnection = (
  relationDefinition: NonNullable<FieldMetadataItem['relationDefinition']>,
  value: unknown,
): value is RecordGqlConnection => {
  switch (relationDefinition.direction) {
    case RelationMetadataType.MANY_TO_MANY:
    case RelationMetadataType.ONE_TO_MANY: {
      return true;
    }
    case RelationMetadataType.MANY_TO_ONE:
    case RelationMetadataType.ONE_TO_ONE: {
      return false;
    }
    default: {
      return assertUnreachable(relationDefinition.direction);
    }
  }
};

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { assertUnreachable } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const isObjectRecordConnection = (
  relation: NonNullable<FieldMetadataItem['relation']>,
  value: unknown,
): value is RecordGqlConnection => {
  switch (relation.type) {
    case RelationType.ONE_TO_MANY: {
      return true;
    }
    case RelationType.MANY_TO_ONE:
      return false;
    default: {
      return assertUnreachable(relation.type);
    }
  }
};

import {
  type FieldWithRelation,
  isRelationFieldOfType,
} from '@/object-metadata/utils/isRelationFieldOfType';
import { RelationType } from '~/generated-metadata/graphql';

export const isOneToManyRelationField = <T extends FieldWithRelation>(
  field: T,
): field is T & { relation: NonNullable<T['relation']> } =>
  isRelationFieldOfType(field, RelationType.ONE_TO_MANY);

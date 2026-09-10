import {
  type FieldWithRelation,
  isRelationFieldOfType,
} from '@/object-metadata/utils/isRelationFieldOfType';
import { RelationType } from '~/generated-metadata/graphql';

export const isManyToOneRelationField = <T extends FieldWithRelation>(
  field: T,
): field is T & { relation: NonNullable<T['relation']> } =>
  isRelationFieldOfType(field, RelationType.MANY_TO_ONE);

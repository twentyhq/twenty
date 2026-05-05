import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  computeRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

// Returns the join column name for a (non-morph) relation field, computed
// from the field's name. Use `getSourceJoinColumnName` when you need the
// join column name for a specific morph target.
export const getJoinColumnName = (
  field: Pick<FieldMetadataItem, 'name'> | undefined | null,
): string | undefined => {
  if (!isDefined(field)) {
    return undefined;
  }
  return computeRelationFieldJoinColumnName({ name: field.name });
};

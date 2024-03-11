import { isUndefined } from '@sniptt/guards';

import { FieldType } from '@/object-record/record-field/types/FieldType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  depth,
  eagerLoadedRelations,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, boolean>;
}): any => {
  const fieldType = field.type as FieldType;

  if (!isUndefined(depth) && depth < 0) {
    return false;
  }

  if (!isUndefined(depth) && depth < 1 && fieldType === 'RELATION') {
    return false;
  }

  if (
    fieldType === 'RELATION' &&
    !isUndefined(eagerLoadedRelations) &&
    (isUndefined(eagerLoadedRelations[field.name]) ||
      !eagerLoadedRelations[field.name])
  ) {
    return false;
  }

  return true;
};

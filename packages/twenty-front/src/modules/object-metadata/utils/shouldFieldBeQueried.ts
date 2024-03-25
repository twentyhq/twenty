import { isUndefined } from '@sniptt/guards';

import { FieldMetadataType } from '~/generated-metadata/graphql';

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
  if (!isUndefined(depth) && depth < 0) {
    return false;
  }

  if (
    !isUndefined(depth) &&
    depth < 1 &&
    field.type === FieldMetadataType.Relation
  ) {
    return false;
  }

  if (
    field.type === FieldMetadataType.Relation &&
    !isUndefined(eagerLoadedRelations) &&
    (isUndefined(eagerLoadedRelations[field.name]) ||
      !eagerLoadedRelations[field.name])
  ) {
    return false;
  }

  return true;
};

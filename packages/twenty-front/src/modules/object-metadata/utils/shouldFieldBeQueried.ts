import { isUndefined } from '@sniptt/guards';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  depth,
  eagerLoadedRelations,
  queryFields,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, boolean>;
  objectRecord?: ObjectRecord;
  queryFields?: Record<string, any>;
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
    field.type === 'RELATION' &&
    !isUndefinedOrNull(eagerLoadedRelations) &&
    (isUndefinedOrNull(eagerLoadedRelations[field.name]) ||
      !isDefined(eagerLoadedRelations[field.name]))
  ) {
    return false;
  }

  if (isDefined(queryFields) && !queryFields[field.name]) {
    return false;
  }

  return true;
};

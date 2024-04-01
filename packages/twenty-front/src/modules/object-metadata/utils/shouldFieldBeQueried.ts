import { isUndefined } from '@sniptt/guards';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  depth,
  queryFields,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  depth?: number;
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

  if (isDefined(queryFields) && !queryFields[field.name]) {
    return false;
  }

  return true;
};

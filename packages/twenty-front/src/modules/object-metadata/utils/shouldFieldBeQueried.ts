import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  queryFields,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  objectRecord?: ObjectRecord;
  queryFields?: Record<string, any>;
}): any => {
  if (
    isUndefinedOrNull(queryFields) &&
    field.type !== FieldMetadataType.Relation
  ) {
    return true;
  }

  if (
    isDefined(queryFields) &&
    isDefined(queryFields[field.name]) &&
    isDefined(queryFields[field.name]) !== false
  ) {
    return true;
  }

  return false;
};

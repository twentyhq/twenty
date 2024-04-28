import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  operationFields,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  objectRecord?: ObjectRecord;
  operationFields?: Record<string, any>;
}): any => {
  if (
    isUndefinedOrNull(operationFields) &&
    field.type !== FieldMetadataType.Relation
  ) {
    return true;
  }

  if (
    isDefined(operationFields) &&
    isDefined(operationFields[field.name]) &&
    isDefined(operationFields[field.name]) !== false
  ) {
    return true;
  }

  return false;
};

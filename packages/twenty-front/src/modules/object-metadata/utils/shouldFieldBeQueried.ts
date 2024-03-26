import { isUndefined } from '@sniptt/guards';

import { FieldType } from '@/object-record/record-field/types/FieldType';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  depth,
  eagerLoadedRelations,
  objectRecord,
  queryFields,
  onlyIdTypename,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, boolean>;
  objectRecord?: ObjectRecord;
  queryFields?: Record<string, any>;
  onlyIdTypename?: boolean;
}): any => {
  const fieldType = field.type as FieldType;

  if (!isUndefined(depth) && depth < 0) {
    return false;
  }

  if (!isUndefined(depth) && depth < 1 && fieldType === 'RELATION') {
    return false;
  }

  if (isDefined(objectRecord) && !isDefined(objectRecord[field.name])) {
    return false;
  }

  if (
    fieldType === 'RELATION' &&
    !isUndefinedOrNull(eagerLoadedRelations) &&
    (isUndefinedOrNull(eagerLoadedRelations[field.name]) ||
      !isDefined(eagerLoadedRelations[field.name]))
  ) {
    return false;
  }

  if (isDefined(queryFields) && !queryFields[field.name]) {
    return false;
  }

  if (
    isDefined(onlyIdTypename) &&
    onlyIdTypename &&
    field.name !== 'id' &&
    field.name !== '__typename'
  ) {
    return false;
  }

  return true;
};

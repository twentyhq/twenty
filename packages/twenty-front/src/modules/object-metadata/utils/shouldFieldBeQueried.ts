import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  field,
  recordGqlFields,
}: {
  field: Pick<FieldMetadataItem, 'name' | 'type'>;
  objectRecord?: ObjectRecord;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}): any => {
  if (
    isUndefinedOrNull(recordGqlFields) &&
    field.type !== FieldMetadataType.RELATION
  ) {
    return true;
  }
  if (
    isDefined(recordGqlFields) &&
    isDefined(recordGqlFields[field.name]) &&
    recordGqlFields[field.name] !== false
  ) {
    return true;
  }

  return false;
};

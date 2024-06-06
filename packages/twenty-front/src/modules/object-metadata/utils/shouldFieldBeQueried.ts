import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
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
    field.type !== FieldMetadataType.Relation
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

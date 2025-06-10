import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  gqlField,
  fieldMetadata,
  recordGqlFields,
}: {
  gqlField: string;
  fieldMetadata: Pick<FieldMetadataItem, 'name' | 'type'>;
  objectRecord?: ObjectRecord;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}): any => {
  if (
    isUndefinedOrNull(recordGqlFields) &&
    fieldMetadata.type !== FieldMetadataType.RELATION
  ) {
    return true;
  }

  if (
    isDefined(recordGqlFields) &&
    isDefined(recordGqlFields[gqlField]) &&
    recordGqlFields[gqlField] !== false
  ) {
    return true;
  }

  return false;
};

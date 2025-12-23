import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const shouldFieldBeQueried = ({
  gqlField,
  fieldMetadata,
  recordGqlFields,
}: {
  gqlField: string;
  fieldMetadata: Pick<FieldMetadataItem, 'name' | 'type' | 'settings'>;
  objectRecord?: ObjectRecord;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}): any => {
  const isJoinColumn: boolean =
    (isFieldRelation(fieldMetadata) || isFieldMorphRelation(fieldMetadata)) &&
    fieldMetadata.settings.joinColumnName === gqlField;

  if (
    isUndefinedOrNull(recordGqlFields) &&
    !isFieldRelation(fieldMetadata) &&
    !isFieldMorphRelation(fieldMetadata)
  ) {
    return true;
  }

  if (isUndefinedOrNull(recordGqlFields) && isJoinColumn) {
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

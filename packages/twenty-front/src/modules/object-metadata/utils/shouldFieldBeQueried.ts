import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
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
  fieldMetadata: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'settings' | 'morphRelations'
  >;
  objectRecord?: ObjectRecord;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}): any => {
  const isJoinColumn: boolean =
    (isFieldRelation(fieldMetadata) || isFieldMorphRelation(fieldMetadata)) &&
    getRelationIdFieldNames(fieldMetadata).includes(gqlField);

  if (
    !isDefined(recordGqlFields) &&
    !isFieldRelation(fieldMetadata) &&
    !isFieldMorphRelation(fieldMetadata)
  ) {
    return true;
  }

  if (!isDefined(recordGqlFields) && isJoinColumn) {
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

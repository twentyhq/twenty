import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '../types/FieldMetadataItem';

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
    isFieldRelation(fieldMetadata) &&
    fieldMetadata.settings.joinColumnName === gqlField;

  if (
    isUndefinedOrNull(recordGqlFields) &&
    (fieldMetadata.type !== FieldMetadataType.RELATION || isJoinColumn)
  ) {
    return true;
  }

  // no sure about that
  const isMorphJoinColumn: boolean =
    isFieldMorphRelation(fieldMetadata) &&
    fieldMetadata.settings.joinColumnName === gqlField;

  if (
    isUndefinedOrNull(recordGqlFields) &&
    (fieldMetadata.type !== FieldMetadataType.MORPH_RELATION ||
      isMorphJoinColumn)
  ) {
    return false;
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

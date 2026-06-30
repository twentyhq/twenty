import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import {
  computeMorphRelationGqlFieldJoinColumnName,
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
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
  const isRelationJoinColumn =
    isFieldRelation(fieldMetadata) &&
    computeRelationGqlFieldJoinColumnName({ name: fieldMetadata.name }) ===
      gqlField;

  const isMorphRelationJoinColumn =
    isFieldMorphRelation(fieldMetadata) &&
    isDefined(fieldMetadata.morphRelations) &&
    fieldMetadata.morphRelations.some(
      (morphRelation) =>
        computeMorphRelationGqlFieldJoinColumnName({
          fieldName: fieldMetadata.name,
          relationType: morphRelation.type,
          targetObjectMetadataNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural:
            morphRelation.targetObjectMetadata.namePlural,
        }) === gqlField,
    );

  const isJoinColumn: boolean =
    isRelationJoinColumn || isMorphRelationJoinColumn;

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

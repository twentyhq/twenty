import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRelationCreationRetryUpdateInput = ({
  recordInput,
  previousRecordInput,
  fieldMetadataItems,
}: {
  recordInput: Partial<ObjectRecord>;
  previousRecordInput: Partial<ObjectRecord>;
  fieldMetadataItems: FieldMetadataItem[];
}) => {
  const updateRecordInput = { ...recordInput };
  const morphRelationIdFieldNames = fieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION,
    )
    .flatMap(getRelationIdFieldNames);

  for (const relationIdFieldName of morphRelationIdFieldNames) {
    if (
      isDefined(previousRecordInput[relationIdFieldName]) &&
      !isDefined(recordInput[relationIdFieldName])
    ) {
      updateRecordInput[relationIdFieldName] = null;
    }
  }

  return updateRecordInput;
};

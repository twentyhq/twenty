import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const computeRecordAttachmentRetryInput = ({
  fieldMetadataItems,
  previousRecordInput,
  recordInput,
}: {
  fieldMetadataItems: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'morphRelations'
  >[];
  previousRecordInput: Partial<ObjectRecord>;
  recordInput: Partial<ObjectRecord>;
}): Partial<ObjectRecord> => {
  const updateRecordInput = { ...recordInput };
  const morphRelationIdFieldNames = fieldMetadataItems
    .filter(({ type }) => type === FieldMetadataType.MORPH_RELATION)
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

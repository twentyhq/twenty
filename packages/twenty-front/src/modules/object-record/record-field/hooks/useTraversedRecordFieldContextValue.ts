import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type GenericFieldContextType } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type UseTraversedRecordFieldContextValueProps = {
  recordField: RecordField;
  rowRecordId: string;
};

// A traversed cell displays a field of the related record, so the field context
// points at that record and stays read-only: editing would change every row
// sharing the same related record.
export const useTraversedRecordFieldContextValue = ({
  recordField,
  rowRecordId,
}: UseTraversedRecordFieldContextValueProps): Pick<
  GenericFieldContextType,
  | 'fieldMetadataItemId'
  | 'recordId'
  | 'fieldDefinition'
  | 'isLabelIdentifier'
  | 'isRecordFieldReadOnly'
  | 'isForbidden'
> | null => {
  const {
    objectMetadataItem,
    fieldDefinitionByRecordFieldKey,
    objectPermissionsByObjectMetadataId,
  } = useRecordIndexContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();

  const fieldDefinition =
    fieldDefinitionByRecordFieldKey[getRecordFieldKey(recordField)];

  const relationTraversal = resolveRecordFieldRelationTraversal({
    recordField,
    sourceObjectMetadataItem: objectMetadataItem,
    objectMetadataItems,
  });

  const relatedRecordId = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: rowRecordId,
      fieldName: `${relationTraversal?.relationFieldMetadataItem.name ?? ''}Id`,
    },
  );

  if (!isDefined(fieldDefinition) || !isDefined(relationTraversal)) {
    return null;
  }

  const { targetObjectMetadataItem, targetFieldMetadataItem } =
    relationTraversal;

  const canReadTargetObject = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    targetObjectMetadataItem.id,
  ).canReadObjectRecords;

  const canReadTargetField = targetObjectMetadataItem.readableFields.some(
    (readableField) => readableField.id === targetFieldMetadataItem.id,
  );

  return {
    fieldMetadataItemId: targetFieldMetadataItem.id,
    recordId: isString(relatedRecordId) ? relatedRecordId : '',
    fieldDefinition,
    isLabelIdentifier: false,
    isRecordFieldReadOnly: true,
    isForbidden: !canReadTargetObject || !canReadTargetField,
  };
};

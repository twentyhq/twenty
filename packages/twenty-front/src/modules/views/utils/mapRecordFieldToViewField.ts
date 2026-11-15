import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ViewField } from '@/views/types/ViewField';

export const mapRecordFieldToViewField = (recordField: RecordField) => {
  const viewField: Omit<ViewField, 'definition'> = {
    id: recordField.id,
    fieldMetadataId: recordField.fieldMetadataItemId,
    isVisible: recordField.isVisible,
    isCanonical: recordField.isCanonical,
    isActive: true,
    position: recordField.position,
    size: recordField.size,
    aggregateOperation: recordField.aggregateOperation,
    settings: recordField.settings,
    relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
  };

  return viewField;
};

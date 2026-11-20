import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { v4 } from 'uuid';

const ADDED_RECORD_FIELD_SIZE = 100;

export const buildAddedRecordField = ({
  currentRecordFields,
  fieldMetadataItemId,
  relationTargetFieldMetadataId,
  relationScope,
}: {
  currentRecordFields: Pick<RecordField, 'position'>[];
} & Pick<
  RecordField,
  'fieldMetadataItemId' | 'relationTargetFieldMetadataId' | 'relationScope'
>): RecordField => ({
  id: v4(),
  fieldMetadataItemId,
  size: ADDED_RECORD_FIELD_SIZE,
  isVisible: true,
  isCanonical: false,
  position:
    Math.max(0, ...currentRecordFields.map(({ position }) => position)) + 1,
  relationTargetFieldMetadataId,
  relationScope,
});

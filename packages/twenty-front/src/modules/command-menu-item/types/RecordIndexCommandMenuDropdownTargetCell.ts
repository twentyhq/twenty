import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

export type RecordIndexCommandMenuDropdownTargetCell = {
  recordId: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
};

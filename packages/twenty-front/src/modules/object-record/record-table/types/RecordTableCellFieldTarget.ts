import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

// The record and field a cell shows: the row's own for plain columns, the related record's for lookups
export type RecordTableCellFieldTarget = {
  recordId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  isRecordReadOnly: boolean;
  restrictedFieldNames: string[];
  fieldValueKey?: string;
};

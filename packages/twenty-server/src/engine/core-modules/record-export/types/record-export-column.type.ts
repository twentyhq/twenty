import { type FieldMetadataType } from 'twenty-shared/types';

export type RecordExportColumn = {
  fieldName: string;
  label: string;
  type: FieldMetadataType;
  subFieldName?: string;
  // Set when the column is read through a many-to-one relation of the exported object
  relationFieldName?: string;
};

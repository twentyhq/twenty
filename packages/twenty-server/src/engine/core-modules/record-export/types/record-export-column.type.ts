import { type FieldMetadataType } from 'twenty-shared/types';

export type RecordExportColumn = {
  fieldName: string;
  label: string;
  type: FieldMetadataType;
  subFieldName?: string;
};

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFieldType } from '@/spreadsheet-import/types/SpreadsheetImportFieldType';
import { type SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import { type SpreadsheetImportFieldDescriptor } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

export type SpreadsheetImportField = Omit<
  SpreadsheetImportFieldDescriptor<FieldMetadataItem>,
  'fieldValidationDefinitions' | 'fieldType'
> & {
  Icon: IconComponent | null | undefined;
  // UI-facing additional information displayed via tooltip and ? icon
  description?: string;
  fieldValidationDefinitions?: SpreadsheetImportFieldValidationDefinition[];
  fieldType: SpreadsheetImportFieldType;
};

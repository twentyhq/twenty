import { SpreadsheetImportFieldType } from '@/spreadsheet-import/types/SpreadsheetImportFieldType';
import { SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconComponent } from 'twenty-ui/display';

export type SpreadsheetImportField<T extends string> = {
  // Icon
  Icon: IconComponent | null | undefined;
  // UI-facing field label
  label: string;
  // Field's unique identifier
  key: T;
  // UI-facing additional information displayed via tooltip and ? icon
  description?: string;
  // Alternate labels used for fields' auto-matching, e.g. "fname" -> "firstName"
  alternateMatches?: string[];
  // Validations used for field entries
  fieldValidationDefinitions?: SpreadsheetImportFieldValidationDefinition[];
  // Field entry component, default: Input
  fieldType: SpreadsheetImportFieldType;
  // Field metadata type
  fieldMetadataType: FieldMetadataType;
  // UI-facing values shown to user as field examples pre-upload phase
  example?: string;
};

import {
  FieldValidationDefinition,
  SpreadsheetImportFieldType,
} from '@/spreadsheet-import/types';
import { IconComponent } from 'twenty-ui';

export type AvailableFieldForImport = {
  icon: IconComponent;
  label: string;
  key: string;
  fieldType: SpreadsheetImportFieldType;
  fieldValidationDefinitions?: FieldValidationDefinition[];
};

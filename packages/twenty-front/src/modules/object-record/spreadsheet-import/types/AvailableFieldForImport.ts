import {
  SpreadsheetImportFieldType,
  SpreadsheetImportFieldValidationDefinition,
} from '@/spreadsheet-import/types';
import { IconComponent } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
export type AvailableFieldForImport = {
  icon: IconComponent;
  label: string;
  key: string;
  fieldType: SpreadsheetImportFieldType;
  fieldValidationDefinitions?: SpreadsheetImportFieldValidationDefinition[];
  fieldMetadataType: FieldMetadataType;
};

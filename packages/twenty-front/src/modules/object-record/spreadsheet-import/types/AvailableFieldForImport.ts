import {
  SpreadsheetImportFieldType,
  SpreadsheetImportFieldValidationDefinition,
} from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { IconComponent } from 'twenty-ui/display';

export type AvailableFieldForImport = {
  Icon: IconComponent;
  label: string;
  key: string;
  fieldType: SpreadsheetImportFieldType;
  fieldValidationDefinitions?: SpreadsheetImportFieldValidationDefinition[];
  fieldMetadataType: FieldMetadataType;
};

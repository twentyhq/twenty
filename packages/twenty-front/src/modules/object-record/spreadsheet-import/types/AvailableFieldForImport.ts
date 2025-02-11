import {
  FieldValidationDefinition,
  SpreadsheetImportFieldType,
} from '@/spreadsheet-import/types';
import { IconComponent } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
export type AvailableFieldForImport = {
  icon: IconComponent;
  label: string;
  key: string;
  fieldType: SpreadsheetImportFieldType;
  fieldValidationDefinitions?: FieldValidationDefinition[];
  fieldMetadataType: FieldMetadataType;
};

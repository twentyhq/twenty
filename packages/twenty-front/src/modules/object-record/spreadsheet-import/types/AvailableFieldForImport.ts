import {
  FieldValidationDefinition,
  SpreadsheetImportFieldType,
} from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { IconComponent } from 'twenty-ui/display';

export type AvailableFieldForImport = {
  icon: IconComponent;
  label: string;
  key: string;
  fieldType: SpreadsheetImportFieldType;
  fieldValidationDefinitions?: FieldValidationDefinition[];
  fieldMetadataType: FieldMetadataType;
};

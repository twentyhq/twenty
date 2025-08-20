import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFieldType } from '@/spreadsheet-import/types/SpreadsheetImportFieldType';
import { type SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types/SpreadsheetImportFieldValidationDefinition';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export type SpreadsheetImportField = {
  // Icon
  Icon: IconComponent | null | undefined;
  // UI-facing field label
  label: string;
  // Field's unique identifier
  key: string;
  // Field's metadata item id - same for all associated nested fields
  fieldMetadataItemId: string;
  // UI-facing additional information displayed via tooltip and ? icon
  description?: string;
  // Validations used for field entries
  fieldValidationDefinitions?: SpreadsheetImportFieldValidationDefinition[];
  // Field entry component, default: Input
  fieldType: SpreadsheetImportFieldType;
  // Field metadata type
  fieldMetadataType: FieldMetadataType;
  // if true, it can be a composite sub-field or a relation connect field (or both)
  isNestedField: boolean;
  // can be true only if isNestedField is true
  isCompositeSubField?: boolean;
  // defined only if isCompositeSubField is true
  compositeSubFieldKey?: string;
  // can be true only if isNestedField is true
  isRelationConnectField?: boolean;
  // defined only if isRelationConnectField is true
  uniqueFieldMetadataItem?: FieldMetadataItem;
};

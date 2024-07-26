import { FieldValidationDefinition } from '@/spreadsheet-import/types';
import { IconComponent } from 'twenty-ui';

export type AvailableFieldForImport = {
  icon: IconComponent;
  label: string;
  key: string;
  fieldType: {
    type: 'input' | 'checkbox';
  };
  fieldValidationDefinitions?: FieldValidationDefinition[];
};

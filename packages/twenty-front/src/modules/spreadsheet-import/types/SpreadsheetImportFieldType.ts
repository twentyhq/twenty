import { type SelectOption } from 'twenty-ui/input';
export type SpreadsheetImportCheckbox = {
  type: 'checkbox';
  // Alternate values to be treated as booleans, e.g. {yes: true, no: false}
  booleanMatches?: { [key: string]: boolean };
};

export type SpreadsheetImportSelect = {
  type: 'select';
  // Options displayed in Select component
  options: SelectOption[];
};

export type SpreadsheetImportMultiSelect = {
  type: 'multiSelect';
  options: SelectOption[];
};

export type SpreadsheetImportInput = {
  type: 'input';
};

export type SpreadsheetImportFieldType =
  | SpreadsheetImportCheckbox
  | SpreadsheetImportSelect
  | SpreadsheetImportMultiSelect
  | SpreadsheetImportInput;

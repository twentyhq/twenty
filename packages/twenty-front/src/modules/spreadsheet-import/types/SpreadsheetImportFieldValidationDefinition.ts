import { type SpreadsheetImportErrorLevel } from '@/spreadsheet-import/types/SpreadsheetImportErrorLevel';

export type SpreadsheetImportRequiredValidation = {
  rule: 'required';
  errorMessage?: string;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportUniqueValidation = {
  rule: 'unique';
  allowEmpty?: boolean;
  errorMessage?: string;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportRegexValidation = {
  rule: 'regex';
  value: string;
  flags?: string;
  errorMessage: string;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportFunctionValidation = {
  rule: 'function';
  isValid: (value: string) => boolean;
  errorMessage: string;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportObjectValidation = {
  rule: 'object';
  isValid: (objectValue: any) => boolean;
  errorMessage: string;
  level?: SpreadsheetImportErrorLevel;
};

export type SpreadsheetImportFieldValidationDefinition =
  | SpreadsheetImportRequiredValidation
  | SpreadsheetImportUniqueValidation
  | SpreadsheetImportRegexValidation
  | SpreadsheetImportFunctionValidation
  | SpreadsheetImportObjectValidation;

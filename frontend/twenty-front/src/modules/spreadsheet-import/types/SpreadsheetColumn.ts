import { type SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';

type SpreadsheetEmptyColumn = {
  type: SpreadsheetColumnType.empty;
  index: number;
  header: string;
};

type SpreadsheetIgnoredColumn = {
  type: SpreadsheetColumnType.ignored;
  index: number;
  header: string;
};

type SpreadsheetMatchedColumn = {
  type: SpreadsheetColumnType.matched;
  index: number;
  header: string;
  value: string;
};

type SpreadsheetMatchedSwitchColumn = {
  type: SpreadsheetColumnType.matchedCheckbox;
  index: number;
  header: string;
  value: string;
};

export type SpreadsheetMatchedSelectColumn = {
  type: SpreadsheetColumnType.matchedSelect;
  index: number;
  header: string;
  value: string;
  matchedOptions: Partial<SpreadsheetMatchedOptions>[];
};

export type SpreadsheetMatchedSelectOptionsColumn = {
  type: SpreadsheetColumnType.matchedSelectOptions;
  index: number;
  header: string;
  value: string;
  matchedOptions: SpreadsheetMatchedOptions[];
};

export type SpreadsheetErrorColumn = {
  type: SpreadsheetColumnType.matchedError;
  index: number;
  header: string;
  value: string;
  errorMessage: string;
};

export type SpreadsheetColumn =
  | SpreadsheetEmptyColumn
  | SpreadsheetIgnoredColumn
  | SpreadsheetMatchedColumn
  | SpreadsheetMatchedSwitchColumn
  | SpreadsheetMatchedSelectColumn
  | SpreadsheetMatchedSelectOptionsColumn
  | SpreadsheetErrorColumn;

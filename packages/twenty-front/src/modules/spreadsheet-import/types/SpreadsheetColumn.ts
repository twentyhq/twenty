import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';

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

type SpreadsheetMatchedColumn<T> = {
  type: SpreadsheetColumnType.matched;
  index: number;
  header: string;
  value: T;
};

type SpreadsheetMatchedSwitchColumn<T> = {
  type: SpreadsheetColumnType.matchedCheckbox;
  index: number;
  header: string;
  value: T;
};

export type SpreadsheetMatchedSelectColumn<T> = {
  type: SpreadsheetColumnType.matchedSelect;
  index: number;
  header: string;
  value: T;
  matchedOptions: Partial<SpreadsheetMatchedOptions<T>>[];
};

export type SpreadsheetMatchedSelectOptionsColumn<T> = {
  type: SpreadsheetColumnType.matchedSelectOptions;
  index: number;
  header: string;
  value: T;
  matchedOptions: SpreadsheetMatchedOptions<T>[];
};

export type SpreadsheetErrorColumn<T> = {
  type: SpreadsheetColumnType.matchedError;
  index: number;
  header: string;
  value: T;
  errorMessage: string;
};

export type SpreadsheetColumn<T extends string> =
  | SpreadsheetEmptyColumn
  | SpreadsheetIgnoredColumn
  | SpreadsheetMatchedColumn<T>
  | SpreadsheetMatchedSwitchColumn<T>
  | SpreadsheetMatchedSelectColumn<T>
  | SpreadsheetMatchedSelectOptionsColumn<T>
  | SpreadsheetErrorColumn<T>;

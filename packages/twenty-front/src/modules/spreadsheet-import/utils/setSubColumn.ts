import {
  SpreadsheetMatchedSelectColumn,
  SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';

export const setSubColumn = <T>(
  oldColumn:
    | SpreadsheetMatchedSelectColumn<T>
    | SpreadsheetMatchedSelectOptionsColumn<T>,
  entry: string,
  value: string,
):
  | SpreadsheetMatchedSelectColumn<T>
  | SpreadsheetMatchedSelectOptionsColumn<T> => {
  const options = oldColumn.matchedOptions.map((option) =>
    option.entry === entry ? { ...option, value } : option,
  );
  const allMatched = options.every(({ value }) => !!value);
  if (allMatched) {
    return {
      ...oldColumn,
      matchedOptions: options as SpreadsheetMatchedOptions<T>[],
      type: SpreadsheetColumnType.matchedSelectOptions,
    };
  } else {
    return {
      ...oldColumn,
      matchedOptions: options as SpreadsheetMatchedOptions<T>[],
      type: SpreadsheetColumnType.matchedSelect,
    };
  }
};

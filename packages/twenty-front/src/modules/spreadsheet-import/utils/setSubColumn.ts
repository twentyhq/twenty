import {
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';

export const setSubColumn = (
  oldColumn:
    | SpreadsheetMatchedSelectColumn
    | SpreadsheetMatchedSelectOptionsColumn,
  entry: string,
  value: string,
): SpreadsheetMatchedSelectColumn | SpreadsheetMatchedSelectOptionsColumn => {
  const shouldUnselectValue =
    oldColumn.matchedOptions.find((option) => option.entry === entry)?.value ===
    value;

  const options = oldColumn.matchedOptions.map((option) =>
    option.entry === entry
      ? { ...option, value: shouldUnselectValue ? undefined : value }
      : option,
  );

  const allMatched = options.every(({ value }) => !!value);
  if (allMatched) {
    return {
      ...oldColumn,
      matchedOptions: options as SpreadsheetMatchedOptions[],
      type: SpreadsheetColumnType.matchedSelectOptions,
    };
  } else {
    return {
      ...oldColumn,
      matchedOptions: options as SpreadsheetMatchedOptions[],
      type: SpreadsheetColumnType.matchedSelect,
    };
  }
};

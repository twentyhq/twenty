import {
  type SpreadsheetColumn,
  SpreadsheetColumnType,
} from 'twenty-shared/utils';

export const setIgnoreColumn = ({
  header,
  index,
}: SpreadsheetColumn): SpreadsheetColumn => ({
  header,
  index,
  type: SpreadsheetColumnType.ignored,
});

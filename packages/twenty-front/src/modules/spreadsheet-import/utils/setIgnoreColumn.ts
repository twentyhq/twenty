import {
  Column,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

export const setIgnoreColumn = <T extends string>({
  header,
  index,
}: Column<T>): Column<T> => ({
  header,
  index,
  type: ColumnType.ignored,
});

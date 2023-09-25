import {
  Column,
  ColumnType,
  MatchColumnsProps,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';

import { uniqueEntries } from './uniqueEntries';

export const setColumn = <T extends string>(
  oldColumn: Column<T>,
  field?: Field<T>,
  data?: MatchColumnsProps<T>['data'],
): Column<T> => {
  switch (field?.fieldType.type) {
    case 'select':
      return {
        ...oldColumn,
        type: ColumnType.matchedSelect,
        value: field.key,
        matchedOptions: uniqueEntries(data || [], oldColumn.index),
      };
    case 'checkbox':
      return {
        index: oldColumn.index,
        type: ColumnType.matchedCheckbox,
        value: field.key,
        header: oldColumn.header,
      };
    case 'input':
      return {
        index: oldColumn.index,
        type: ColumnType.matched,
        value: field.key,
        header: oldColumn.header,
      };
    default:
      return {
        index: oldColumn.index,
        header: oldColumn.header,
        type: ColumnType.empty,
      };
  }
};

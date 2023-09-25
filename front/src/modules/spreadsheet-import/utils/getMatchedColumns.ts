import lavenstein from 'js-levenshtein';

import {
  type Column,
  type Columns,
  type MatchColumnsProps,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field, Fields } from '@/spreadsheet-import/types';

import { findMatch } from './findMatch';
import { setColumn } from './setColumn';

export const getMatchedColumns = <T extends string>(
  columns: Columns<T>,
  fields: Fields<T>,
  data: MatchColumnsProps<T>['data'],
  autoMapDistance: number,
) =>
  columns.reduce<Column<T>[]>((arr, column) => {
    const autoMatch = findMatch(column.header, fields, autoMapDistance);
    if (autoMatch) {
      const field = fields.find((field) => field.key === autoMatch) as Field<T>;
      const duplicateIndex = arr.findIndex(
        (column) => 'value' in column && column.value === field.key,
      );
      const duplicate = arr[duplicateIndex];
      if (duplicate && 'value' in duplicate) {
        return lavenstein(duplicate.value, duplicate.header) <
          lavenstein(autoMatch, column.header)
          ? [
              ...arr.slice(0, duplicateIndex),
              setColumn(arr[duplicateIndex], field, data),
              ...arr.slice(duplicateIndex + 1),
              setColumn(column),
            ]
          : [
              ...arr.slice(0, duplicateIndex),
              setColumn(arr[duplicateIndex]),
              ...arr.slice(duplicateIndex + 1),
              setColumn(column, field, data),
            ];
      } else {
        return [...arr, setColumn(column, field, data)];
      }
    } else {
      return [...arr, column];
    }
  }, []);

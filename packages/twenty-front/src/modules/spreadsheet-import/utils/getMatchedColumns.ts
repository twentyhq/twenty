import lavenstein from 'js-levenshtein';

import { MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

import {
  SpreadsheetImportField,
  SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { isDefined } from 'twenty-shared/utils';
import { findMatch } from './findMatch';
import { setColumn } from './setColumn';

export const getMatchedColumns = <T extends string>(
  columns: SpreadsheetColumns<T>,
  fields: SpreadsheetImportFields<T>,
  data: MatchColumnsStepProps['data'],
  autoMapDistance: number,
) =>
  columns.reduce<SpreadsheetColumn<T>[]>((arr, column) => {
    const autoMatch = findMatch(column.header, fields, autoMapDistance);
    if (isDefined(autoMatch)) {
      const field = fields.find(
        (field) => field.key === autoMatch,
      ) as SpreadsheetImportField<T>;
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

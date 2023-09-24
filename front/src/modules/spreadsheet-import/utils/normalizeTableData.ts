import {
  Columns,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import {
  type Data,
  type Fields,
  type RawData,
} from '@/spreadsheet-import/types';

import { normalizeCheckboxValue } from './normalizeCheckboxValue';

export const normalizeTableData = <T extends string>(
  columns: Columns<T>,
  data: RawData[],
  fields: Fields<T>,
) =>
  data.map((row) =>
    columns.reduce((acc, column, index) => {
      const curr = row[index];
      switch (column.type) {
        case ColumnType.matchedCheckbox: {
          const field = fields.find((field) => field.key === column.value);

          if (!field) {
            return acc;
          }

          if (
            'booleanMatches' in field.fieldType &&
            Object.keys(field.fieldType).length
          ) {
            const booleanMatchKey = Object.keys(
              field.fieldType.booleanMatches || [],
            ).find((key) => key.toLowerCase() === curr?.toLowerCase());

            if (!booleanMatchKey) {
              return acc;
            }

            const booleanMatch =
              field.fieldType.booleanMatches?.[booleanMatchKey];
            acc[column.value] = booleanMatchKey
              ? booleanMatch
              : normalizeCheckboxValue(curr);
          } else {
            acc[column.value] = normalizeCheckboxValue(curr);
          }
          return acc;
        }
        case ColumnType.matched: {
          acc[column.value] = curr === '' ? undefined : curr;
          return acc;
        }
        case ColumnType.matchedSelect:
        case ColumnType.matchedSelectOptions: {
          const matchedOption = column.matchedOptions.find(
            ({ entry }) => entry === curr,
          );
          acc[column.value] = matchedOption?.value || undefined;
          return acc;
        }
        case ColumnType.empty:
        case ColumnType.ignored: {
          return acc;
        }
        default:
          return acc;
      }
    }, {} as Data<T>),
  );

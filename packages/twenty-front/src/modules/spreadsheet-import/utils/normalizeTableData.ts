import {
  Columns,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import {
  Fields,
  ImportedRow,
  ImportedStructuredRow,
} from '@/spreadsheet-import/types';

import { isDefined } from '@ui/utilities/isDefined';
import { z } from 'zod';
import { normalizeCheckboxValue } from './normalizeCheckboxValue';

export const normalizeTableData = <T extends string>(
  columns: Columns<T>,
  data: ImportedRow[],
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
            Object.keys(field.fieldType).length > 0
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
          const field = fields.find((field) => field.key === column.value);

          if (!field) {
            return acc;
          }

          if (field.fieldType.type === 'multiSelect' && isDefined(curr)) {
            const currentOptionsSchema = z.preprocess(
              (value) => JSON.parse(z.string().parse(value)),
              z.array(z.unknown()),
            );

            const rawCurrentOptions = currentOptionsSchema.safeParse(curr).data;

            const matchedOptionValues = [
              ...new Set(
                rawCurrentOptions
                  ?.map(
                    (option) =>
                      column.matchedOptions.find(
                        (matchedOption) => matchedOption.entry === option,
                      )?.value,
                  )
                  .filter(isDefined),
              ),
            ];

            const fieldValue =
              matchedOptionValues && matchedOptionValues.length > 0
                ? JSON.stringify(matchedOptionValues)
                : undefined;

            acc[column.value] = fieldValue;
          } else {
            const matchedOption = column.matchedOptions.find(
              ({ entry }) => entry === curr,
            );
            acc[column.value] = matchedOption?.value || undefined;
          }
          return acc;
        }
        case ColumnType.empty:
        case ColumnType.ignored: {
          return acc;
        }
        default:
          return acc;
      }
    }, {} as ImportedStructuredRow<T>),
  );

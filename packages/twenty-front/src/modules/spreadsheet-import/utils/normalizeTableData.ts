import {
  type ImportedRow,
  type ImportedStructuredRow,
  type SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { spreadsheetImportParseMultiSelectOptionsOrThrow } from '@/spreadsheet-import/utils/spreadsheetImportParseMultiSelectOptionsOrThrow';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { normalizeCheckboxValue } from './normalizeCheckboxValue';

export const normalizeTableData = (
  columns: SpreadsheetColumns,
  data: ImportedRow[],
  fields: SpreadsheetImportFields,
) =>
  data.map((row) =>
    columns.reduce((acc, column, index) => {
      const curr = row[index];
      switch (column.type) {
        case SpreadsheetColumnType.matchedCheckbox: {
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
        case SpreadsheetColumnType.matched: {
          acc[column.value] = curr === '' ? undefined : curr;
          return acc;
        }
        case SpreadsheetColumnType.matchedSelect:
        case SpreadsheetColumnType.matchedSelectOptions: {
          const field = fields.find((field) => field.key === column.value);

          if (!field) {
            return acc;
          }

          if (field.fieldType.type === 'multiSelect' && isDefined(curr)) {
            const currentOptionsSchema = z.preprocess((value) => {
              return spreadsheetImportParseMultiSelectOptionsOrThrow(value);
            }, z.array(z.unknown()));

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
        case SpreadsheetColumnType.empty:
        case SpreadsheetColumnType.ignored: {
          return acc;
        }
        default:
          return acc;
      }
    }, {} as ImportedStructuredRow),
  );

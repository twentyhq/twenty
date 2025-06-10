import { MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

import { SpreadsheetImportField } from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { z } from 'zod';
import { uniqueEntries } from './uniqueEntries';

export const setColumn = <T extends string>(
  oldColumn: SpreadsheetColumn<T>,
  field?: SpreadsheetImportField<T>,
  data?: MatchColumnsStepProps['data'],
): SpreadsheetColumn<T> => {
  if (field?.fieldType.type === 'select') {
    const fieldOptions = field.fieldType.options;
    const uniqueData = uniqueEntries(
      data || [],
      oldColumn.index,
    ) as SpreadsheetMatchedOptions<T>[];

    const matchedOptions = uniqueData.map((record) => {
      const value = fieldOptions.find(
        (fieldOption) =>
          fieldOption.value === record.entry ||
          fieldOption.label === record.entry,
      )?.value;
      return value
        ? ({ ...record, value } as SpreadsheetMatchedOptions<T>)
        : (record as SpreadsheetMatchedOptions<T>);
    });
    const allMatched =
      matchedOptions.filter((o) => o.value).length === uniqueData?.length;

    return {
      ...oldColumn,
      type: allMatched
        ? SpreadsheetColumnType.matchedSelectOptions
        : SpreadsheetColumnType.matchedSelect,
      value: field.key,
      matchedOptions,
    };
  }

  if (field?.fieldType.type === 'multiSelect') {
    const fieldOptions = field.fieldType.options;

    const entries = [
      ...new Set(
        data
          ?.flatMap((row) => {
            try {
              const value = row[oldColumn.index];
              const options = JSON.parse(z.string().parse(value));
              return z.array(z.string()).parse(options);
            } catch {
              return [];
            }
          })
          .filter((entry) => typeof entry === 'string'),
      ),
    ];

    const matchedOptions = entries.map((entry) => {
      const value = fieldOptions.find(
        (fieldOption) =>
          fieldOption.value === entry || fieldOption.label === entry,
      )?.value;
      return value
        ? ({ entry, value } as SpreadsheetMatchedOptions<T>)
        : ({ entry } as SpreadsheetMatchedOptions<T>);
    });
    const areAllMatched =
      matchedOptions.filter((option) => option.value).length ===
      entries?.length;

    return {
      ...oldColumn,
      type: areAllMatched
        ? SpreadsheetColumnType.matchedSelectOptions
        : SpreadsheetColumnType.matchedSelect,
      value: field.key,
      matchedOptions,
    };
  }

  if (field?.fieldType.type === 'checkbox') {
    return {
      index: oldColumn.index,
      type: SpreadsheetColumnType.matchedCheckbox,
      value: field.key,
      header: oldColumn.header,
    };
  }

  if (field?.fieldType.type === 'input') {
    return {
      index: oldColumn.index,
      type: SpreadsheetColumnType.matched,
      value: field.key,
      header: oldColumn.header,
    };
  }

  return {
    index: oldColumn.index,
    header: oldColumn.header,
    type: SpreadsheetColumnType.empty,
  };
};

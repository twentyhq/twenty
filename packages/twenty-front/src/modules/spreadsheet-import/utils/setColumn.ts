import { MatchColumnsStepProps } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';

import { SpreadsheetImportField } from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { uniqueEntries } from './uniqueEntries';

export const setColumn = (
  oldColumn: SpreadsheetColumn,
  field?: SpreadsheetImportField,
  data?: MatchColumnsStepProps['data'],
): SpreadsheetColumn => {
  if (field?.fieldType.type === 'select') {
    const fieldOptions = field.fieldType.options;
    const uniqueData = uniqueEntries(
      data || [],
      oldColumn.index,
    ) as SpreadsheetMatchedOptions[];

    const matchedOptions = uniqueData.map((record) => {
      const value = fieldOptions.find(
        (fieldOption) =>
          fieldOption.value === record.entry ||
          fieldOption.label === record.entry,
      )?.value;
      return value
        ? ({ ...record, value } as SpreadsheetMatchedOptions)
        : (record as SpreadsheetMatchedOptions);
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

    let entries: string[] = [];
    try {
      entries = [
        ...new Set(
          data
            ?.flatMap((row) => {
              const value = row[oldColumn.index];
              if (!isDefined(value)) return [];
              const options = JSON.parse(z.string().parse(value));
              return z.array(z.string()).parse(options);
            })
            .filter((entry) => typeof entry === 'string'),
        ),
      ];
    } catch {
      return {
        index: oldColumn.index,
        header: oldColumn.header,
        type: SpreadsheetColumnType.matchedError,
        value: field.key,
        errorMessage: t`column data is not compatible with Multi-Select.`,
      };
    }

    const matchedOptions = entries.map((entry) => {
      const value = fieldOptions.find(
        (fieldOption) =>
          fieldOption.value === entry || fieldOption.label === entry,
      )?.value;
      return value
        ? ({ entry, value } as SpreadsheetMatchedOptions)
        : ({ entry } as SpreadsheetMatchedOptions);
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

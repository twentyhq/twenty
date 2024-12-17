import {
  Column,
  ColumnType,
  MatchColumnsStepProps,
  MatchedOptions,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';

import { z } from 'zod';
import { uniqueEntries } from './uniqueEntries';

export const setColumn = <T extends string>(
  oldColumn: Column<T>,
  field?: Field<T>,
  data?: MatchColumnsStepProps['data'],
): Column<T> => {
  if (field?.fieldType.type === 'select') {
    const fieldOptions = field.fieldType.options;
    const uniqueData = uniqueEntries(
      data || [],
      oldColumn.index,
    ) as MatchedOptions<T>[];

    const matchedOptions = uniqueData.map((record) => {
      const value = fieldOptions.find(
        (fieldOption) =>
          fieldOption.value === record.entry ||
          fieldOption.label === record.entry,
      )?.value;
      return value
        ? ({ ...record, value } as MatchedOptions<T>)
        : (record as MatchedOptions<T>);
    });
    const allMatched =
      matchedOptions.filter((o) => o.value).length === uniqueData?.length;

    return {
      ...oldColumn,
      type: allMatched
        ? ColumnType.matchedSelectOptions
        : ColumnType.matchedSelect,
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
        ? ({ entry, value } as MatchedOptions<T>)
        : ({ entry } as MatchedOptions<T>);
    });
    const areAllMatched =
      matchedOptions.filter((option) => option.value).length ===
      entries?.length;

    return {
      ...oldColumn,
      type: areAllMatched
        ? ColumnType.matchedSelectOptions
        : ColumnType.matchedSelect,
      value: field.key,
      matchedOptions,
    };
  }

  if (field?.fieldType.type === 'checkbox') {
    return {
      index: oldColumn.index,
      type: ColumnType.matchedCheckbox,
      value: field.key,
      header: oldColumn.header,
    };
  }

  if (field?.fieldType.type === 'input') {
    return {
      index: oldColumn.index,
      type: ColumnType.matched,
      value: field.key,
      header: oldColumn.header,
    };
  }

  return {
    index: oldColumn.index,
    header: oldColumn.header,
    type: ColumnType.empty,
  };
};

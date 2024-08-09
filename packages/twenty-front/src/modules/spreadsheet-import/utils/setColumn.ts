import {
  Column,
  ColumnType,
  MatchColumnsStepProps,
  MatchedOptions,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';

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

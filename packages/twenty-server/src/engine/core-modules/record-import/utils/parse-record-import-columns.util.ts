import {
  isDefined,
  SpreadsheetColumnType,
  type SpreadsheetColumn,
  type SpreadsheetColumns,
  type SpreadsheetImportFieldDescriptor,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { type RecordImportMappedField } from 'src/engine/core-modules/record-import/types/record-import-session.type';

const matchedOptionsSchema = z
  .array(
    z.object({
      entry: z.string().max(32_767),
      value: z.string().optional(),
    }),
  )
  .max(10_000);

const columnSchema = z.object({
  index: z.number().int().nonnegative(),
  type: z.enum(SpreadsheetColumnType),
  value: z.string().optional(),
  matchedOptions: matchedOptionsSchema.optional(),
});

// Columns come from the browser: every field key and option value must
// exist in the live metadata, and the result is rebuilt from scratch so no
// unexpected property reaches the session (SEC-7).
export const parseRecordImportColumns = ({
  columns,
  headerValues,
  fields,
}: {
  columns: unknown[];
  headerValues: string[];
  fields: SpreadsheetImportFieldDescriptor[];
}): SpreadsheetColumns | undefined => {
  const parsedColumns = z.array(columnSchema).safeParse(columns);

  if (
    !parsedColumns.success ||
    parsedColumns.data.length !== headerValues.length
  ) {
    return undefined;
  }

  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const usedKeys = new Set<string>();
  const result: SpreadsheetColumn[] = [];

  for (const [position, column] of parsedColumns.data.entries()) {
    const header = headerValues[position];

    if (column.index !== position) {
      return undefined;
    }

    if (
      column.type === SpreadsheetColumnType.empty ||
      column.type === SpreadsheetColumnType.ignored ||
      column.type === SpreadsheetColumnType.matchedError
    ) {
      result.push({
        type:
          column.type === SpreadsheetColumnType.empty
            ? SpreadsheetColumnType.empty
            : SpreadsheetColumnType.ignored,
        index: position,
        header,
      });
      continue;
    }

    const field = isDefined(column.value)
      ? fieldByKey.get(column.value)
      : undefined;

    if (!isDefined(field) || usedKeys.has(field.key)) {
      return undefined;
    }

    usedKeys.add(field.key);

    switch (column.type) {
      case SpreadsheetColumnType.matched:
      case SpreadsheetColumnType.matchedCheckbox:
        result.push({
          type: column.type,
          index: position,
          header,
          value: field.key,
        });
        break;
      case SpreadsheetColumnType.matchedSelect:
      case SpreadsheetColumnType.matchedSelectOptions: {
        if (
          field.fieldType.type !== 'select' &&
          field.fieldType.type !== 'multiSelect'
        ) {
          return undefined;
        }

        const optionValues = new Set(
          field.fieldType.options.map((option) => option.value),
        );
        const matchedOptions = (column.matchedOptions ?? []).map(
          ({ entry, value }) => ({
            entry,
            value:
              isDefined(value) && optionValues.has(value) ? value : undefined,
          }),
        );

        if (
          matchedOptions.some(
            ({ value }, index) =>
              value !== column.matchedOptions?.[index]?.value,
          )
        ) {
          return undefined;
        }

        result.push({
          type: SpreadsheetColumnType.matchedSelect,
          index: position,
          header,
          value: field.key,
          matchedOptions,
        });
        break;
      }
    }
  }

  return result;
};

export const buildRecordImportMappedFields = (
  columns: SpreadsheetColumns,
  fields: SpreadsheetImportFieldDescriptor[],
): RecordImportMappedField[] => {
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));

  return columns.flatMap((column) => {
    const field = 'value' in column ? fieldByKey.get(column.value) : undefined;

    if (!isDefined(field)) {
      return [];
    }

    return [
      {
        key: field.key,
        fieldMetadataId:
          field.uniqueFieldMetadataItem?.id ?? field.fieldMetadataItemId,
        fieldMetadataType: field.fieldMetadataType,
        optionValues:
          'matchedOptions' in column
            ? column.matchedOptions
                .map((option) => option.value)
                .filter(isDefined)
            : undefined,
      },
    ];
  });
};

// The data model can change between mapping and import (DATA-6): every
// mapped field must still be importable with the same type and options.
export const isRecordImportMappingOutdated = (
  mappedFields: RecordImportMappedField[],
  fields: SpreadsheetImportFieldDescriptor[],
): boolean => {
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));

  return mappedFields.some((mappedField) => {
    const field = fieldByKey.get(mappedField.key);

    if (
      !isDefined(field) ||
      (field.uniqueFieldMetadataItem?.id ?? field.fieldMetadataItemId) !==
        mappedField.fieldMetadataId ||
      field.fieldMetadataType !== mappedField.fieldMetadataType
    ) {
      return true;
    }

    if (!isDefined(mappedField.optionValues)) {
      return false;
    }

    const optionValues = new Set(
      field.fieldType.type === 'select' ||
        field.fieldType.type === 'multiSelect'
        ? field.fieldType.options.map((option) => option.value)
        : [],
    );

    return mappedField.optionValues.some((value) => !optionValues.has(value));
  });
};

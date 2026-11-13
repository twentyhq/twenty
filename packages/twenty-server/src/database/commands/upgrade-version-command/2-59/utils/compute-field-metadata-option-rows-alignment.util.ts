import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export type EnumFieldToAlign = {
  id: string;
  applicationId: string;
  options: unknown;
};

export type ExistingFieldMetadataOptionRow = {
  id: string;
  universalIdentifier: string;
  fieldMetadataId: string;
  value: string;
  label: string;
  color: string | null;
  position: number;
};

type FieldMetadataOptionRowColumns = Pick<
  ExistingFieldMetadataOptionRow,
  'value' | 'label' | 'color' | 'position'
>;

export type FieldMetadataOptionRowToInsert = FieldMetadataOptionRowColumns & {
  universalIdentifier: string;
  fieldMetadataId: string;
  applicationId: string;
};

export type FieldMetadataOptionRowToUpdate = FieldMetadataOptionRowColumns & {
  id: string;
};

const COMPARED_COLUMNS = ['value', 'label', 'color', 'position'] as const;

const isLowercaseUniversalIdentifier = (
  optionId: unknown,
): optionId is string =>
  isString(optionId) &&
  isValidUniversalIdentifier(optionId) &&
  optionId === optionId.toLowerCase();

// Readers used stored options so far, so rows follow them, matched by id then by value (unique per field).
export const computeFieldMetadataOptionRowsAlignment = ({
  enumFields,
  existingOptionRows,
  generateUniversalIdentifier,
}: {
  enumFields: EnumFieldToAlign[];
  existingOptionRows: ExistingFieldMetadataOptionRow[];
  generateUniversalIdentifier: () => string;
}): {
  optionRowsToInsert: FieldMetadataOptionRowToInsert[];
  optionRowsToUpdate: FieldMetadataOptionRowToUpdate[];
  optionRowIdsToDelete: string[];
} => {
  const optionRowsToInsert: FieldMetadataOptionRowToInsert[] = [];
  const optionRowsToUpdate: FieldMetadataOptionRowToUpdate[] = [];
  const optionRowIdsToDelete: string[] = [];

  const claimedUniversalIdentifiers = new Set(
    existingOptionRows.map(({ universalIdentifier }) => universalIdentifier),
  );
  const existingOptionRowsByFieldMetadataId = new Map<
    string,
    ExistingFieldMetadataOptionRow[]
  >();

  for (const existingOptionRow of existingOptionRows) {
    existingOptionRowsByFieldMetadataId.set(existingOptionRow.fieldMetadataId, [
      ...(existingOptionRowsByFieldMetadataId.get(
        existingOptionRow.fieldMetadataId,
      ) ?? []),
      existingOptionRow,
    ]);
  }

  for (const enumField of enumFields) {
    if (!Array.isArray(enumField.options)) {
      continue;
    }

    const fieldOptionRows =
      existingOptionRowsByFieldMetadataId.get(enumField.id) ?? [];
    const keptOptionRowIds = new Set<string>();
    const seenValues = new Set<string>();

    for (const [index, option] of enumField.options.entries()) {
      if (
        !isPlainObject(option) ||
        !isNonEmptyString(option.value) ||
        !isString(option.label) ||
        seenValues.has(option.value)
      ) {
        continue;
      }

      seenValues.add(option.value);

      const targetColumns: FieldMetadataOptionRowColumns = {
        value: option.value,
        label: option.label,
        color: isString(option.color) ? option.color : null,
        position: isNumber(option.position) ? option.position : index,
      };

      const optionRow =
        fieldOptionRows.find(
          ({ universalIdentifier }) => universalIdentifier === option.id,
        ) ?? fieldOptionRows.find(({ value }) => value === option.value);

      if (isDefined(optionRow) && !keptOptionRowIds.has(optionRow.id)) {
        keptOptionRowIds.add(optionRow.id);

        if (
          COMPARED_COLUMNS.some(
            (column) => optionRow[column] !== targetColumns[column],
          )
        ) {
          optionRowsToUpdate.push({ id: optionRow.id, ...targetColumns });
        }
        continue;
      }

      const universalIdentifier =
        isLowercaseUniversalIdentifier(option.id) &&
        !claimedUniversalIdentifiers.has(option.id)
          ? option.id
          : generateUniversalIdentifier();

      claimedUniversalIdentifiers.add(universalIdentifier);
      optionRowsToInsert.push({
        universalIdentifier,
        fieldMetadataId: enumField.id,
        applicationId: enumField.applicationId,
        ...targetColumns,
      });
    }

    optionRowIdsToDelete.push(
      ...fieldOptionRows
        .filter(({ id }) => !keptOptionRowIds.has(id))
        .map(({ id }) => id),
    );
  }

  return { optionRowsToInsert, optionRowsToUpdate, optionRowIdsToDelete };
};

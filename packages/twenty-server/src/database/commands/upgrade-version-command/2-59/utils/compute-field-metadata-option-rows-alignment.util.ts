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

// Stored options are what every reader used so far, so the rows are brought to them. A stored option
// reuses the row holding its id, else the row holding its value, since a field cannot hold a value twice.
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
        isString(option.id) &&
        isValidUniversalIdentifier(option.id) &&
        option.id === option.id.toLowerCase() &&
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

import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { isPlainObject, isValidUuid } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type StoredOption = Record<string, unknown>;

export type EnumFieldToBackfill = {
  id: string;
  applicationId: string;
  options: unknown;
};

export type FieldMetadataOptionRowToInsert = {
  universalIdentifier: string;
  fieldMetadataId: string;
  applicationId: string;
  value: string;
  label: string;
  color: string | null;
  position: number;
};

// Option ids become universal identifiers, so a missing, malformed or reused id is
// regenerated and written back to the field; a repeated value keeps only its first row.
export const computeFieldMetadataOptionBackfill = ({
  enumFields,
  existingFieldMetadataIdByUniversalIdentifier,
}: {
  enumFields: EnumFieldToBackfill[];
  existingFieldMetadataIdByUniversalIdentifier: Map<string, string>;
}): {
  optionsToRewriteByFieldMetadataId: Map<string, StoredOption[]>;
  optionRowsToInsert: FieldMetadataOptionRowToInsert[];
} => {
  const optionsToRewriteByFieldMetadataId = new Map<string, StoredOption[]>();
  const optionRowsToInsert: FieldMetadataOptionRowToInsert[] = [];
  const claimedUniversalIdentifiers = new Set<string>();

  for (const enumField of enumFields) {
    if (!Array.isArray(enumField.options)) {
      continue;
    }

    const seenValues = new Set<string>();
    let hasRegeneratedId = false;

    const options = enumField.options
      .filter(isPlainObject)
      .map((option, index) => {
        const existingFieldMetadataId = isString(option.id)
          ? existingFieldMetadataIdByUniversalIdentifier.get(option.id)
          : undefined;
        const isIdReusable =
          isString(option.id) &&
          isValidUuid(option.id) &&
          !claimedUniversalIdentifiers.has(option.id) &&
          (existingFieldMetadataId === undefined ||
            existingFieldMetadataId === enumField.id);
        const id = isIdReusable ? (option.id as string) : v4();

        hasRegeneratedId ||= !isIdReusable;
        claimedUniversalIdentifiers.add(id);

        if (
          isNonEmptyString(option.value) &&
          isString(option.label) &&
          !seenValues.has(option.value)
        ) {
          seenValues.add(option.value);
          optionRowsToInsert.push({
            universalIdentifier: id,
            fieldMetadataId: enumField.id,
            applicationId: enumField.applicationId,
            value: option.value,
            label: option.label,
            color: isString(option.color) ? option.color : null,
            position: isNumber(option.position) ? option.position : index,
          });
        }

        return isIdReusable ? option : { ...option, id };
      });

    if (hasRegeneratedId) {
      optionsToRewriteByFieldMetadataId.set(enumField.id, options);
    }
  }

  return { optionsToRewriteByFieldMetadataId, optionRowsToInsert };
};

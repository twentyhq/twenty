import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
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

const isOwnedByFieldOrUnused = ({
  fieldMetadataId,
  existingFieldMetadataId,
}: {
  fieldMetadataId: string;
  existingFieldMetadataId: string | undefined;
}) =>
  !isDefined(existingFieldMetadataId) ||
  existingFieldMetadataId === fieldMetadataId;

// Option ids become universal identifiers, so unusable ids are regenerated and written back.
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
        const reusableId =
          isString(option.id) &&
          isValidUniversalIdentifier(option.id) &&
          option.id === option.id.toLowerCase() &&
          !claimedUniversalIdentifiers.has(option.id) &&
          isOwnedByFieldOrUnused({
            fieldMetadataId: enumField.id,
            existingFieldMetadataId:
              existingFieldMetadataIdByUniversalIdentifier.get(option.id),
          })
            ? option.id
            : undefined;
        const id = reusableId ?? v4();

        hasRegeneratedId ||= !isDefined(reusableId);
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

        return isDefined(reusableId) ? option : { ...option, id };
      });

    if (hasRegeneratedId) {
      optionsToRewriteByFieldMetadataId.set(enumField.id, options);
    }
  }

  return { optionsToRewriteByFieldMetadataId, optionRowsToInsert };
};

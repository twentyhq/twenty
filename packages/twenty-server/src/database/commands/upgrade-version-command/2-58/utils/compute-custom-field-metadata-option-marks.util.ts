import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataOption =
  | FieldMetadataDefaultOption
  | FieldMetadataComplexOption;

export type EnumFieldToMark = {
  id: string;
  universalIdentifier: string;
  applicationId: string;
  options: FieldMetadataOption[] | null;
};

export type OptionRowToMark = {
  id: string;
  universalIdentifier: string;
  fieldMetadataId: string;
  applicationId: string;
  value: string;
};

// The 2.57 backfill gave every option row its field's application, so options a workspace
// added to a standard field are told apart by a value the standard field does not declare.
export const computeCustomFieldMetadataOptionMarks = ({
  enumFields,
  optionRows,
  standardOptionValuesByFieldUniversalIdentifier,
  twentyStandardApplicationId,
}: {
  enumFields: EnumFieldToMark[];
  optionRows: OptionRowToMark[];
  standardOptionValuesByFieldUniversalIdentifier: Map<string, Set<string>>;
  twentyStandardApplicationId: string;
}): {
  optionRowIdsToMoveToWorkspaceCustomApplication: string[];
  optionsToRewriteByFieldMetadataId: Map<string, FieldMetadataOption[]>;
} => {
  const optionRowsByFieldMetadataId = new Map<string, OptionRowToMark[]>();

  for (const optionRow of optionRows) {
    optionRowsByFieldMetadataId.set(optionRow.fieldMetadataId, [
      ...(optionRowsByFieldMetadataId.get(optionRow.fieldMetadataId) ?? []),
      optionRow,
    ]);
  }

  const optionRowIdsToMoveToWorkspaceCustomApplication: string[] = [];
  const optionsToRewriteByFieldMetadataId = new Map<
    string,
    FieldMetadataOption[]
  >();

  for (const enumField of enumFields) {
    const standardOptionValues =
      enumField.applicationId === twentyStandardApplicationId
        ? standardOptionValuesByFieldUniversalIdentifier.get(
            enumField.universalIdentifier,
          )
        : undefined;
    const customOptionIds = new Set<string>();

    for (const optionRow of optionRowsByFieldMetadataId.get(enumField.id) ??
      []) {
      if (optionRow.applicationId !== enumField.applicationId) {
        customOptionIds.add(optionRow.universalIdentifier);
        continue;
      }

      if (
        isDefined(standardOptionValues) &&
        !standardOptionValues.has(optionRow.value)
      ) {
        customOptionIds.add(optionRow.universalIdentifier);
        optionRowIdsToMoveToWorkspaceCustomApplication.push(optionRow.id);
      }
    }

    const options = enumField.options ?? [];
    const hasOptionToMark = options.some(
      (option) =>
        isDefined(option.id) &&
        customOptionIds.has(option.id) &&
        option.isCustom !== true,
    );

    if (!hasOptionToMark) {
      continue;
    }

    optionsToRewriteByFieldMetadataId.set(
      enumField.id,
      options.map((option) =>
        isDefined(option.id) && customOptionIds.has(option.id)
          ? { ...option, isCustom: true }
          : option,
      ),
    );
  }

  return {
    optionRowIdsToMoveToWorkspaceCustomApplication,
    optionsToRewriteByFieldMetadataId,
  };
};

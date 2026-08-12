import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type LabelIdentifierFormula,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const FORMULA_INPUT_TOKEN_REGEX = /\{([^{}]+)\}/g;
const FORMULA_TEMPLATE_SLOT_REGEX = /\{(\d+)\}/g;

export const isFieldMetadataItemEligibleForLabelIdentifierFormula = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES.includes(
    fieldMetadataItem.type as (typeof LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES)[number],
  ) &&
  (fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE);

export const parseLabelIdentifierFormulaInput = ({
  fieldMetadataItems,
  formulaInput,
}: {
  fieldMetadataItems: FieldMetadataItem[];
  formulaInput: string;
}):
  | { status: 'disabled' }
  | { status: 'invalid'; error: string }
  | { status: 'valid'; formula: LabelIdentifierFormula } => {
  const trimmedFormulaInput = formulaInput.trim();

  if (trimmedFormulaInput.length === 0) {
    return { status: 'disabled' };
  }

  const formulaInputWithoutTokens = trimmedFormulaInput.replace(
    FORMULA_INPUT_TOKEN_REGEX,
    '',
  );

  if (
    formulaInputWithoutTokens.includes('{') ||
    formulaInputWithoutTokens.includes('}')
  ) {
    return {
      status: 'invalid',
      error: 'Use braces around each field API name',
    };
  }

  const fieldMetadataItemByName = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.name,
      fieldMetadataItem,
    ]),
  );
  const fieldReferences: LabelIdentifierFormula['fieldReferences'] = [];
  let template = '';
  let previousMatchEnd = 0;

  for (const match of trimmedFormulaInput.matchAll(FORMULA_INPUT_TOKEN_REGEX)) {
    template += trimmedFormulaInput.slice(previousMatchEnd, match.index);
    const fieldNames = match[1]
      .split('??')
      .map((fieldName) => fieldName.trim())
      .filter((fieldName) => fieldName.length > 0);

    if (fieldNames.length === 0) {
      return { status: 'invalid', error: 'Formula contains an empty field' };
    }

    const referencedFieldMetadataItems = fieldNames.map((fieldName) =>
      fieldMetadataItemByName.get(fieldName),
    );
    const missingFieldName = fieldNames.find(
      (_, index) => !isDefined(referencedFieldMetadataItems[index]),
    );

    if (isDefined(missingFieldName)) {
      return {
        status: 'invalid',
        error: `Field "${missingFieldName}" does not exist or cannot be used in a record label formula`,
      };
    }

    template += `{${fieldReferences.length}}`;
    fieldReferences.push({
      fieldMetadataUniversalIdentifiers: referencedFieldMetadataItems.map(
        (fieldMetadataItem) => fieldMetadataItem!.universalIdentifier,
      ),
    });
    previousMatchEnd = match.index + match[0].length;
  }

  template += trimmedFormulaInput.slice(previousMatchEnd);

  if (fieldReferences.length === 0) {
    return {
      status: 'invalid',
      error: 'A formula must contain at least one field',
    };
  }

  return {
    status: 'valid',
    formula: {
      template,
      fieldReferences,
    },
  };
};

export const formatLabelIdentifierFormulaForInput = ({
  fieldMetadataItems,
  formula,
}: {
  fieldMetadataItems: FieldMetadataItem[];
  formula: LabelIdentifierFormula | undefined;
}): string => {
  if (!isDefined(formula)) {
    return '';
  }

  const fieldMetadataItemByUniversalIdentifier = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.universalIdentifier,
      fieldMetadataItem,
    ]),
  );

  return formula.template.replace(
    FORMULA_TEMPLATE_SLOT_REGEX,
    (_match, slotIndexValue: string) => {
      const fieldReference = formula.fieldReferences[Number(slotIndexValue)];

      if (!isDefined(fieldReference)) {
        return '';
      }

      const fieldNames = fieldReference.fieldMetadataUniversalIdentifiers.map(
        (fieldMetadataUniversalIdentifier) =>
          fieldMetadataItemByUniversalIdentifier.get(
            fieldMetadataUniversalIdentifier,
          )?.name ?? 'missingField',
      );

      return `{${fieldNames.join(' ?? ')}}`;
    },
  );
};

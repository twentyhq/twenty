import { type LabelIdentifierFormula } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const FORMULA_SLOT_REGEX = /\{(\d+)\}/g;

export const evaluateLabelIdentifierFormula = ({
  formula,
  resolveFieldValue,
}: {
  formula: LabelIdentifierFormula;
  resolveFieldValue: (fieldMetadataUniversalIdentifier: string) => string;
}): string => {
  let hasResolvedValue = false;

  const evaluatedFormula = formula.template.replace(
    FORMULA_SLOT_REGEX,
    (_match, slotIndexValue: string) => {
      const fieldReference = formula.fieldReferences[Number(slotIndexValue)];

      if (!isDefined(fieldReference)) {
        return '';
      }

      for (const fieldMetadataUniversalIdentifier of fieldReference.fieldMetadataUniversalIdentifiers) {
        const fieldValue = resolveFieldValue(
          fieldMetadataUniversalIdentifier,
        ).trim();

        if (fieldValue.length > 0) {
          hasResolvedValue = true;
          return fieldValue;
        }
      }

      return '';
    },
  );

  return hasResolvedValue ? evaluatedFormula.replace(/\s+/g, ' ').trim() : '';
};

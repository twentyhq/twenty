import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type NthFormula } from '@/polyfills/selectors/types/NthFormula';

const INTEGER_FORMULA_PATTERN = /^[+-]?\d+$/;

const STEP_FORMULA_PATTERN = /^([+-]?)(\d*)n(?:\s*([+-])\s*(\d+))?$/;

const NTH_FORMULA_BY_KEYWORD: Record<string, NthFormula> = {
  odd: { step: 2, offset: 1 },
  even: { step: 2, offset: 0 },
};

export const parseNthFormula = (formulaText: string): NthFormula | null => {
  const normalizedFormulaText = formulaText.trim().toLowerCase();
  const keywordFormula = NTH_FORMULA_BY_KEYWORD[normalizedFormulaText];

  if (isDefined(keywordFormula)) {
    return keywordFormula;
  }

  if (INTEGER_FORMULA_PATTERN.test(normalizedFormulaText)) {
    return { step: 0, offset: Number(normalizedFormulaText) };
  }

  const stepFormulaMatch = STEP_FORMULA_PATTERN.exec(normalizedFormulaText);

  if (!isDefined(stepFormulaMatch)) {
    return null;
  }

  const [, stepSign, stepDigits, offsetSign, offsetDigits] = stepFormulaMatch;
  const step =
    (stepSign === '-' ? -1 : 1) *
    Number(isNonEmptyString(stepDigits) ? stepDigits : '1');
  const offset = isDefined(offsetDigits)
    ? (offsetSign === '-' ? -1 : 1) * Number(offsetDigits)
    : 0;

  return { step, offset };
};

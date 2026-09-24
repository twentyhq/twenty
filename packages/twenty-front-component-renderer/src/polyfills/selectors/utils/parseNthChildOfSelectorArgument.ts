import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type NthChildOfSelectorArgument } from '@/polyfills/selectors/types/NthChildOfSelectorArgument';
import { parseNthFormula } from '@/polyfills/selectors/utils/parseNthFormula';

const NTH_CHILD_OF_SELECTOR_ARGUMENT_PATTERN = /^(.*?)\s+of\s+(.*)$/is;

export const parseNthChildOfSelectorArgument = (
  argument: string,
): NthChildOfSelectorArgument | null => {
  const argumentMatch = NTH_CHILD_OF_SELECTOR_ARGUMENT_PATTERN.exec(argument);

  if (!isDefined(argumentMatch)) {
    return null;
  }

  const [, formulaText, selectorsText] = argumentMatch;
  const nthFormula = parseNthFormula(formulaText);

  if (!isDefined(nthFormula) || !isNonEmptyString(selectorsText.trim())) {
    return null;
  }

  return { nthFormula, selectorsText: selectorsText.trim() };
};

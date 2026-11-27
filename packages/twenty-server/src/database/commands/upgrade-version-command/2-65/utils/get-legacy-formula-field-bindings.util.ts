import { isString } from '@sniptt/guards';
import { type ValidationRuleBindings } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const getLegacyFormulaFieldBindings = ({
  formula,
}: {
  formula?: unknown;
}): ValidationRuleBindings => {
  if (!isPlainObject(formula) || !isPlainObject(formula.bindings)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(formula.bindings).filter(
      (binding): binding is [string, string] => isString(binding[1]),
    ),
  );
};

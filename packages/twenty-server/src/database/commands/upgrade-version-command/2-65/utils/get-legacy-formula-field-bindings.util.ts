import { isString } from '@sniptt/guards';
import { type ValidationRuleBindings } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const getLegacyFormulaFieldBindings = ({
  settings,
}: {
  settings?: unknown;
}): ValidationRuleBindings => {
  if (!isPlainObject(settings) || !isPlainObject(settings.formula)) {
    return {};
  }

  const bindings = settings.formula.bindings;

  if (!isPlainObject(bindings)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(bindings).filter((binding): binding is [string, string] =>
      isString(binding[1]),
    ),
  );
};

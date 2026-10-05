import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import { resolveInput } from 'twenty-shared/utils';

const VARIABLE_PATTERN = /\{\{[^{}]+\}\}/g;

// each variable is resolved on its own, so one the run cannot resolve keeps its text instead of reading "undefined"
export const resolveFormInstructions = ({
  instructions,
  context,
}: {
  instructions: string | undefined;
  context: Record<string, unknown>;
}): string | undefined => {
  if (!isNonEmptyString(instructions?.trim())) {
    return undefined;
  }

  return instructions.replace(VARIABLE_PATTERN, (variable) => {
    const value = resolveInput(variable, context);

    if (isUndefined(value)) {
      return variable;
    }

    return isString(value) ? value : JSON.stringify(value);
  });
};

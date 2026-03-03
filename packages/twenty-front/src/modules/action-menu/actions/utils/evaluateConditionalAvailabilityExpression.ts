import { Parser } from 'expr-eval';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

const parser = new Parser();

parser.functions.isDefined = (value: unknown) => isDefined(value);
parser.functions.isNonEmptyString = (value: unknown) =>
  isNonEmptyString(value);

export const evaluateConditionalAvailabilityExpression = (
  expression: string | null | undefined,
  context: Record<string, unknown>,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = parser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};

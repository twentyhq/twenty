import { toExprEval } from './to-expr-eval';

const CONDITIONAL_AVAILABILITY_EXPRESSION_PATTERN =
  /(conditionalAvailabilityExpression\s*:\s*)(?!['"`])([^,}]+)/g;

export const transformConditionalAvailabilityExpressionsForEsBuildPlugin = (
  source: string,
): string =>
  source.replace(
    CONDITIONAL_AVAILABILITY_EXPRESSION_PATTERN,
    (_, prefix: string, rawExpression: string) =>
      prefix + JSON.stringify(toExprEval(rawExpression.trim())),
  );

import { isDefined, tokenizeValidationRuleExpression } from 'twenty-shared/utils';

import { VALIDATION_RULE_FIELD_SYMBOL_PREFIX } from 'src/database/commands/upgrade-version-command/2-46/constants/validation-rule-field-symbol-prefix.constant';
import { type ValidationRuleExpressionAndBindings } from 'src/database/commands/upgrade-version-command/2-46/types/validation-rule-expression-and-bindings.type';

export const convertValidationRuleToFieldSymbols = ({
  expression,
  bindings,
}: ValidationRuleExpressionAndBindings):
  | (ValidationRuleExpressionAndBindings & { hasUnconvertedFields: boolean })
  | null => {
  const bindingPaths = Object.keys(bindings);

  if (
    bindingPaths.length === 0 ||
    bindingPaths.every((bindingPath) =>
      bindingPath.startsWith(VALIDATION_RULE_FIELD_SYMBOL_PREFIX),
    )
  ) {
    return null;
  }

  const symbolByUniversalIdentifier = new Map<string, string>();

  const getFieldSymbol = (universalIdentifier: string): string => {
    const existingSymbol = symbolByUniversalIdentifier.get(universalIdentifier);

    if (isDefined(existingSymbol)) {
      return existingSymbol;
    }

    const symbol = `${VALIDATION_RULE_FIELD_SYMBOL_PREFIX}${symbolByUniversalIdentifier.size + 1}`;

    symbolByUniversalIdentifier.set(universalIdentifier, symbol);

    return symbol;
  };

  const convertedExpression = tokenizeValidationRuleExpression(expression)
    .map((token) => {
      if (token.type !== 'path') {
        return token.text;
      }

      const [rootSegment, memberSegment, ...remainingSegments] =
        token.text.split('.');
      const rootUniversalIdentifier = isDefined(rootSegment)
        ? bindings[rootSegment]
        : undefined;

      if (!isDefined(rootUniversalIdentifier)) {
        return token.text;
      }

      const memberUniversalIdentifier = isDefined(memberSegment)
        ? bindings[`${rootSegment}.${memberSegment}`]
        : undefined;

      return [
        getFieldSymbol(rootUniversalIdentifier),
        isDefined(memberUniversalIdentifier)
          ? getFieldSymbol(memberUniversalIdentifier)
          : memberSegment,
        ...remainingSegments,
      ]
        .filter(isDefined)
        .join('.');
    })
    .join('');

  return {
    expression: convertedExpression,
    hasUnconvertedFields: Object.values(bindings).some(
      (universalIdentifier) =>
        !symbolByUniversalIdentifier.has(universalIdentifier),
    ),
    bindings: Object.fromEntries(
      [...symbolByUniversalIdentifier].map(([universalIdentifier, symbol]) => [
        symbol,
        universalIdentifier,
      ]),
    ),
  };
};

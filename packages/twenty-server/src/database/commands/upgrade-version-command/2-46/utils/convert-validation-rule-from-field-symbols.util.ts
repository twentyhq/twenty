import { isDefined, tokenizeValidationRuleExpression } from 'twenty-shared/utils';

import { VALIDATION_RULE_FIELD_SYMBOL_PREFIX } from 'src/database/commands/upgrade-version-command/2-46/constants/validation-rule-field-symbol-prefix.constant';

type ValidationRuleExpressionAndBindings = {
  expression: string;
  bindings: Record<string, string>;
};

export const convertValidationRuleFromFieldSymbols = ({
  expression,
  bindings,
  fieldNameByUniversalIdentifier,
}: ValidationRuleExpressionAndBindings & {
  fieldNameByUniversalIdentifier: Map<string, string>;
}): ValidationRuleExpressionAndBindings | null => {
  const bindingPaths = Object.keys(bindings);

  if (
    bindingPaths.length === 0 ||
    !bindingPaths.every((bindingPath) =>
      bindingPath.startsWith(VALIDATION_RULE_FIELD_SYMBOL_PREFIX),
    )
  ) {
    return null;
  }

  const legacyBindings: Record<string, string> = {};

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

      if (!isDefined(rootSegment) || !isDefined(rootUniversalIdentifier)) {
        return token.text;
      }

      const rootName =
        fieldNameByUniversalIdentifier.get(rootUniversalIdentifier) ??
        rootSegment;

      legacyBindings[rootName] = rootUniversalIdentifier;

      const memberUniversalIdentifier = isDefined(memberSegment)
        ? bindings[memberSegment]
        : undefined;

      if (!isDefined(memberSegment) || !isDefined(memberUniversalIdentifier)) {
        return [rootName, memberSegment, ...remainingSegments]
          .filter(isDefined)
          .join('.');
      }

      const memberName =
        fieldNameByUniversalIdentifier.get(memberUniversalIdentifier) ??
        memberSegment;

      legacyBindings[`${rootName}.${memberName}`] = memberUniversalIdentifier;

      return [rootName, memberName, ...remainingSegments].join('.');
    })
    .join('');

  return { expression: convertedExpression, bindings: legacyBindings };
};

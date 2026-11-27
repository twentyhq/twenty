import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

const collectFieldNames = (
  fields: ValidationRuleFieldDescriptor[],
): [string, string][] =>
  fields.flatMap((field): [string, string][] => [
    [field.universalIdentifier, field.name],
    ...collectFieldNames(field.relationTargetFields ?? []),
  ]);

// Legacy bindings map each path prefix of the text to a field; a deleted field keeps its old name
export const renameLegacyExpressionToCurrentFieldNames = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: Record<string, string>;
  fields: ValidationRuleFieldDescriptor[];
}): string => {
  const fieldNameByUniversalIdentifier = new Map(collectFieldNames(fields));

  return tokenizeValidationRuleExpression(expression)
    .map((token) => {
      if (token.type !== 'path') {
        return token.text;
      }

      const segments = token.text.split('.');

      return segments
        .map((segment, index) => {
          const boundUniversalIdentifier =
            bindings[segments.slice(0, index + 1).join('.')];

          return (
            (isDefined(boundUniversalIdentifier)
              ? fieldNameByUniversalIdentifier.get(boundUniversalIdentifier)
              : undefined) ?? segment
          );
        })
        .join('.');
    })
    .join('');
};

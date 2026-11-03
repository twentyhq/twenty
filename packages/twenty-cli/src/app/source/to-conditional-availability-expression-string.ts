import ts from 'typescript';

import { ARRAY_LENGTH_VARIABLE_NAMES } from '@/app/source/constants/array-length-variable-names.constant';
import { getConditionalAvailabilityExpressionTokenText } from '@/app/source/get-conditional-availability-expression-token-text';
import { isConditionalAvailabilityExpressionTrailingComma } from '@/app/source/is-conditional-availability-expression-trailing-comma';
import { scanConditionalAvailabilityExpressionTokens } from '@/app/source/scan-conditional-availability-expression-tokens';

export const toConditionalAvailabilityExpressionString = (
  expressionText: string,
): string => {
  const tokens = scanConditionalAvailabilityExpressionTokens(expressionText);
  let expressionString = '';

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (
      token.kind === ts.SyntaxKind.Identifier &&
      ARRAY_LENGTH_VARIABLE_NAMES.includes(token.text) &&
      tokens[index + 1]?.kind === ts.SyntaxKind.DotToken &&
      tokens[index + 2]?.text === 'length'
    ) {
      expressionString += `arrayLength(${token.text})`;
      index += 2;
      continue;
    }

    if (
      token.kind === ts.SyntaxKind.CommaToken &&
      isConditionalAvailabilityExpressionTrailingComma({ tokens, index })
    ) {
      continue;
    }

    expressionString += getConditionalAvailabilityExpressionTokenText(token);
  }

  return expressionString;
};

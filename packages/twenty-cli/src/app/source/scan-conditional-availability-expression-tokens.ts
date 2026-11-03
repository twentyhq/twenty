import ts from 'typescript';

import { type ScannedToken } from '@/app/source/types/scanned-token.type';

export const scanConditionalAvailabilityExpressionTokens = (
  expressionText: string,
): ScannedToken[] => {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.Standard,
    expressionText,
  );
  const tokens: ScannedToken[] = [];

  for (
    let kind = scanner.scan();
    kind !== ts.SyntaxKind.EndOfFileToken;
    kind = scanner.scan()
  ) {
    tokens.push({ kind, text: scanner.getTokenText() });
  }

  return tokens;
};

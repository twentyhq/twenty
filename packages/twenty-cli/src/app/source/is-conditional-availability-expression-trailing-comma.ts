import ts from 'typescript';

import { type ScannedToken } from '@/app/source/types/scanned-token.type';

export const isConditionalAvailabilityExpressionTrailingComma = ({
  tokens,
  index,
}: {
  tokens: ScannedToken[];
  index: number;
}): boolean => {
  let nextIndex = index + 1;

  while (
    tokens[nextIndex]?.kind === ts.SyntaxKind.WhitespaceTrivia ||
    tokens[nextIndex]?.kind === ts.SyntaxKind.NewLineTrivia
  ) {
    nextIndex++;
  }

  return tokens[nextIndex]?.kind === ts.SyntaxKind.CloseParenToken;
};

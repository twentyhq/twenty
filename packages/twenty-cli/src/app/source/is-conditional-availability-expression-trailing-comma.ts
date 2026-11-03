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
    tokens[nextIndex]?.kind === ts.SyntaxKind.NewLineTrivia ||
    tokens[nextIndex]?.kind === ts.SyntaxKind.SingleLineCommentTrivia ||
    tokens[nextIndex]?.kind === ts.SyntaxKind.MultiLineCommentTrivia
  ) {
    nextIndex++;
  }

  return tokens[nextIndex]?.kind === ts.SyntaxKind.CloseParenToken;
};

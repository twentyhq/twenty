import ts from 'typescript';

import { type ScannedToken } from '@/app/source/types/scanned-token.type';

export const getConditionalAvailabilityExpressionTokenText = (
  token: ScannedToken,
): string => {
  switch (token.kind) {
    case ts.SyntaxKind.AmpersandAmpersandToken:
      return 'and';
    case ts.SyntaxKind.BarBarToken:
      return 'or';
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
      return '==';
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      return '!=';
    case ts.SyntaxKind.ExclamationToken:
      return 'not ';
    default:
      return token.text;
  }
};

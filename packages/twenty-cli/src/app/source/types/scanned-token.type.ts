import type ts from 'typescript';

export type ScannedToken = {
  kind: ts.SyntaxKind;
  text: string;
};

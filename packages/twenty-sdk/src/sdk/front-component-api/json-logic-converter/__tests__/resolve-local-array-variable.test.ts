import { Node, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { resolveLocalArrayVariable } from '../utils/resolve-local-array-variable';

const resolveIdentifier = (code: string, identifierName: string): unknown => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);

  const targetIdentifier = identifiers.find(
    (identifier) =>
      identifier.getText() === identifierName &&
      Node.isExpressionStatement(identifier.getParent()),
  );

  if (!targetIdentifier) {
    throw new Error(
      `No "${identifierName}" identifier found in expression statement`,
    );
  }

  return resolveLocalArrayVariable(targetIdentifier);
};

describe('resolveLocalArrayVariable', () => {
  it('resolves a local array of string literals', () => {
    expect(
      resolveIdentifier(
        'const statuses = ["a", "b", "c"]; statuses;',
        'statuses',
      ),
    ).toEqual(['a', 'b', 'c']);
  });

  it('resolves a local array of numeric literals', () => {
    expect(resolveIdentifier('const nums = [1, 2, 3]; nums;', 'nums')).toEqual([
      1, 2, 3,
    ]);
  });

  it('returns undefined for non-identifier nodes', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('temp.ts', '"hello";');
    const stringLiteral = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.StringLiteral,
    );

    expect(resolveLocalArrayVariable(stringLiteral)).toBeUndefined();
  });

  it('returns undefined when variable is not declared as array', () => {
    expect(
      resolveIdentifier('const notArray = "hello"; notArray;', 'notArray'),
    ).toBeUndefined();
  });

  it('returns undefined when identifier has no declaration in scope', () => {
    expect(resolveIdentifier('undeclared;', 'undeclared')).toBeUndefined();
  });
});

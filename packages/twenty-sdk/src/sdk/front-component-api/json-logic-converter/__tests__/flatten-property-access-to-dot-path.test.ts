import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { flattenPropertyAccessToDotPath } from '../utils/flatten-property-access-to-dot-path';

const getExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('flattenPropertyAccessToDotPath', () => {
  it('returns the identifier name for a simple identifier', () => {
    expect(
      flattenPropertyAccessToDotPath({ node: getExpression('foo;') }),
    ).toBe('foo');
  });

  it('flattens a single property access', () => {
    expect(
      flattenPropertyAccessToDotPath({ node: getExpression('foo.bar;') }),
    ).toBe('foo.bar');
  });

  it('flattens deeply nested property access', () => {
    expect(
      flattenPropertyAccessToDotPath({ node: getExpression('a.b.c.d;') }),
    ).toBe('a.b.c.d');
  });

  it('strips non-null assertions', () => {
    expect(
      flattenPropertyAccessToDotPath({ node: getExpression('foo!.bar;') }),
    ).toBe('foo.bar');
  });

  it('strips chained non-null assertions', () => {
    expect(
      flattenPropertyAccessToDotPath({ node: getExpression('a!.b!.c;') }),
    ).toBe('a.b.c');
  });

  it('throws for unsupported node kinds', () => {
    const expression = getExpression('foo[0];');

    expect(() =>
      flattenPropertyAccessToDotPath({ node: expression }),
    ).toThrow('Cannot flatten property access');
  });
});

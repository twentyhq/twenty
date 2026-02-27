import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { resolvePropertyPath } from '../utils/resolve-property-path';

const getExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('resolvePropertyPath', () => {
  it('returns the identifier name for a simple identifier', () => {
    expect(
      resolvePropertyPath({ node: getExpression('foo;') }),
    ).toBe('foo');
  });

  it('flattens a single property access', () => {
    expect(
      resolvePropertyPath({ node: getExpression('foo.bar;') }),
    ).toBe('foo.bar');
  });

  it('flattens deeply nested property access', () => {
    expect(
      resolvePropertyPath({ node: getExpression('a.b.c.d;') }),
    ).toBe('a.b.c.d');
  });

  it('strips non-null assertions', () => {
    expect(
      resolvePropertyPath({ node: getExpression('foo!.bar;') }),
    ).toBe('foo.bar');
  });

  it('strips chained non-null assertions', () => {
    expect(
      resolvePropertyPath({ node: getExpression('a!.b!.c;') }),
    ).toBe('a.b.c');
  });

  it('throws for unsupported node kinds', () => {
    const expression = getExpression('foo[0];');

    expect(() =>
      resolvePropertyPath({ node: expression }),
    ).toThrow('Cannot flatten property access');
  });
});

import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { resolveExpressionToStringValue } from '../utils/resolve-expression-to-string-value';

const getExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('resolveExpressionToStringValue', () => {
  it('resolves a string literal directly', () => {
    expect(
      resolveExpressionToStringValue({
        argumentExpression: getExpression('"hello";'),
      }),
    ).toBe('hello');
  });

  it('resolves a known constant dot path to string', () => {
    expect(
      resolveExpressionToStringValue({
        argumentExpression: getExpression('CoreObjectNameSingular.Company;'),
      }),
    ).toBe('company');
  });

  it('resolves a FeatureFlagKey constant to string', () => {
    expect(
      resolveExpressionToStringValue({
        argumentExpression: getExpression(
          'FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED;',
        ),
      }),
    ).toBe('IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED');
  });

  it('throws for unresolvable expression', () => {
    expect(() =>
      resolveExpressionToStringValue({
        argumentExpression: getExpression('someUnknownVar;'),
      }),
    ).toThrow(JsonLogicConversionError);
  });

  it('throws for numeric expressions', () => {
    expect(() =>
      resolveExpressionToStringValue({
        argumentExpression: getExpression('42;'),
      }),
    ).toThrow(JsonLogicConversionError);
  });
});

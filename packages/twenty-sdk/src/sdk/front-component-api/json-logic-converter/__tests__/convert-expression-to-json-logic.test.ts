import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertExpressionToJsonLogic } from '../utils/convert-expression-to-json-logic';

const getExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('convertExpressionToJsonLogic', () => {
  describe('literals', () => {
    it('converts true', () => {
      expect(convertExpressionToJsonLogic(getExpression('true;'))).toBe(true);
    });

    it('converts false', () => {
      expect(convertExpressionToJsonLogic(getExpression('false;'))).toBe(false);
    });

    it('converts null', () => {
      expect(convertExpressionToJsonLogic(getExpression('null;'))).toBeNull();
    });

    it('converts string literal', () => {
      expect(convertExpressionToJsonLogic(getExpression('"hello";'))).toBe(
        'hello',
      );
    });

    it('converts numeric literal', () => {
      expect(convertExpressionToJsonLogic(getExpression('42;'))).toBe(42);
    });
  });

  describe('identifiers', () => {
    it('converts undefined to null', () => {
      expect(
        convertExpressionToJsonLogic(getExpression('undefined;')),
      ).toBeNull();
    });

    it('converts unknown identifier to var', () => {
      expect(
        convertExpressionToJsonLogic(getExpression('someUnknownVar;')),
      ).toEqual({ var: 'someUnknownVar' });
    });

    it('converts known param to var', () => {
      expect(
        convertExpressionToJsonLogic(getExpression('isShowPage;')),
      ).toEqual({ var: 'isShowPage' });
    });
  });

  describe('property access', () => {
    it('converts known param property to var', () => {
      expect(
        convertExpressionToJsonLogic(
          getExpression('objectPermissions.canUpdate;'),
        ),
      ).toEqual({ var: 'objectPermissions.canUpdate' });
    });

    it('resolves known constant dot path', () => {
      expect(
        convertExpressionToJsonLogic(
          getExpression('CoreObjectNameSingular.Company;'),
        ),
      ).toBe('company');
    });
  });

  describe('wrapper expressions', () => {
    it('unwraps parenthesized expression', () => {
      expect(convertExpressionToJsonLogic(getExpression('(true);'))).toBe(true);
    });

    it('unwraps as expression', () => {
      expect(
        convertExpressionToJsonLogic(getExpression('(a as boolean);')),
      ).toEqual({ var: 'a' });
    });

    it('unwraps non-null expression', () => {
      expect(convertExpressionToJsonLogic(getExpression('a!;'))).toEqual({
        var: 'a',
      });
    });
  });

  describe('unary expressions', () => {
    it('converts negation', () => {
      expect(convertExpressionToJsonLogic(getExpression('!a;'))).toEqual({
        '!': [{ var: 'a' }],
      });
    });

    it('throws for unsupported unary operators', () => {
      expect(() => convertExpressionToJsonLogic(getExpression('~a;'))).toThrow(
        JsonLogicConversionError,
      );
    });
  });

  it('throws for unsupported expression kinds', () => {
    expect(() =>
      convertExpressionToJsonLogic(getExpression('[1, 2, 3];')),
    ).toThrow(JsonLogicConversionError);
  });
});

import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertBinaryExpressionToJsonLogic } from '../utils/convert-binary-expression-to-json-logic';

const getExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('convertBinaryExpressionToJsonLogic', () => {
  it('converts && to and', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a && b;')),
    ).toEqual({ and: [{ var: 'a' }, { var: 'b' }] });
  });

  it('converts || to or', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a || b;')),
    ).toEqual({ or: [{ var: 'a' }, { var: 'b' }] });
  });

  it('converts === to strict equal', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a === "x";')),
    ).toEqual({ '===': [{ var: 'a' }, 'x'] });
  });

  it('converts !== to strict not equal', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a !== "x";')),
    ).toEqual({ '!==': [{ var: 'a' }, 'x'] });
  });

  it('converts < to less than', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a < 10;')),
    ).toEqual({ '<': [{ var: 'a' }, 10] });
  });

  it('converts <= to less than or equal', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a <= 10;')),
    ).toEqual({ '<=': [{ var: 'a' }, 10] });
  });

  it('converts > to greater than', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a > 10;')),
    ).toEqual({ '>': [{ var: 'a' }, 10] });
  });

  it('converts >= to greater than or equal', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a >= 10;')),
    ).toEqual({ '>=': [{ var: 'a' }, 10] });
  });

  it('strips ?? false by returning left operand', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a ?? false;')),
    ).toEqual({ var: 'a' });
  });

  it('strips || false by returning left operand', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a || false;')),
    ).toEqual({ var: 'a' });
  });

  it('flattens nested && into a single and', () => {
    expect(
      convertBinaryExpressionToJsonLogic(getExpression('a && b && c;')),
    ).toEqual({ and: [{ var: 'a' }, { var: 'b' }, { var: 'c' }] });
  });

  it('throws JsonLogicConversionError for unsupported operators', () => {
    expect(() =>
      convertBinaryExpressionToJsonLogic(getExpression('a + b;')),
    ).toThrow(JsonLogicConversionError);
  });

  it('throws JsonLogicConversionError for non-binary expression', () => {
    expect(() =>
      convertBinaryExpressionToJsonLogic(getExpression('a;')),
    ).toThrow(JsonLogicConversionError);
  });
});

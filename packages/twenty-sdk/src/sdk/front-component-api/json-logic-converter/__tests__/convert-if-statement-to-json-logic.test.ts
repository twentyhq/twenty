import { type IfStatement, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertIfStatementToJsonLogic } from '../utils/convert-if-statement-to-json-logic';

const getIfStatement = (code: string): IfStatement => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.IfStatement);
};

describe('convertIfStatementToJsonLogic', () => {
  it('converts if block with return expression', () => {
    const result = convertIfStatementToJsonLogic({
      statement: getIfStatement('if (a) { return true; }'),
    });

    expect(result).toEqual({ condition: { var: 'a' }, result: true });
  });

  it('converts if with direct return statement', () => {
    const result = convertIfStatementToJsonLogic({
      statement: getIfStatement('if (a) return true;'),
    });

    expect(result).toEqual({ condition: { var: 'a' }, result: true });
  });

  it('defaults result to true when return has no expression in block', () => {
    const result = convertIfStatementToJsonLogic({
      statement: getIfStatement('if (a) { return; }'),
    });

    expect(result).toEqual({ condition: { var: 'a' }, result: true });
  });

  it('defaults result to true when direct return has no expression', () => {
    const result = convertIfStatementToJsonLogic({
      statement: getIfStatement('if (a) return;'),
    });

    expect(result).toEqual({ condition: { var: 'a' }, result: true });
  });

  it('throws when if block has no return statement', () => {
    expect(() =>
      convertIfStatementToJsonLogic({
        statement: getIfStatement('if (a) { const x = 1; }'),
      }),
    ).toThrow(JsonLogicConversionError);
  });

  it('throws for unsupported then statement kinds', () => {
    expect(() =>
      convertIfStatementToJsonLogic({
        statement: getIfStatement('if (a) throw new Error("x");'),
      }),
    ).toThrow(JsonLogicConversionError);
  });
});

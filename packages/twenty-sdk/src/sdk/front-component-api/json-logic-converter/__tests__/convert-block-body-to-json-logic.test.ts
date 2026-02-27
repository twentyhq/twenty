import { type Block, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertBlockBodyToJsonLogic } from '../utils/convert-block-body-to-json-logic';

const getBlock = (arrowFnBody: string): Block => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    'temp.ts',
    `const fn = () => ${arrowFnBody};`,
  );

  return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.Block);
};

describe('convertBlockBodyToJsonLogic', () => {
  it('converts a simple return statement', () => {
    expect(
      convertBlockBodyToJsonLogic({ block: getBlock('{ return true; }') }),
    ).toBe(true);
  });

  it('converts if/return to json-logic if', () => {
    expect(
      convertBlockBodyToJsonLogic({
        block: getBlock('{ if (a) { return true; } return false; }'),
      }),
    ).toEqual({ if: [{ var: 'a' }, true, false] });
  });

  it('converts multiple if branches', () => {
    expect(
      convertBlockBodyToJsonLogic({
        block: getBlock(
          '{ if (a) { return 1; } if (b) { return 2; } return 3; }',
        ),
      }),
    ).toEqual({ if: [{ var: 'a' }, 1, { var: 'b' }, 2, 3] });
  });

  it('skips variable statements', () => {
    expect(
      convertBlockBodyToJsonLogic({
        block: getBlock(
          '{ const arr = ["a", "b"]; if (isSelectAll === true) { return true; } return false; }',
        ),
      }),
    ).toEqual({
      if: [{ '===': [{ var: 'isSelectAll' }, true] }, true, false],
    });
  });

  it('throws for unsupported block statements', () => {
    expect(() =>
      convertBlockBodyToJsonLogic({ block: getBlock('{ for (;;) {} }') }),
    ).toThrow(JsonLogicConversionError);
  });

  it('throws when block has no return or if statements', () => {
    expect(() =>
      convertBlockBodyToJsonLogic({ block: getBlock('{ const x = 1; }') }),
    ).toThrow(JsonLogicConversionError);
  });
});

import { Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertArrowFunctionToJsonLogic } from '../utils/convert-arrow-function-to-json-logic';

const convert = (arrowFnSource: string): unknown => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    'temp.ts',
    `const fn = ${arrowFnSource};`,
  );
  const arrowFunctions = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  return convertArrowFunctionToJsonLogic({ node: arrowFunctions[0] });
};

describe('convertSomeCallToJsonLogic', () => {
  it('converts .some() with arrow predicate to some operator', () => {
    expect(
      convert(
        '({ loadedRecords }) => loadedRecords.some((record) => record.active)',
      ),
    ).toEqual({
      some: [{ var: 'loadedRecords' }, { var: 'record.active' }],
    });
  });

  it('throws for .some() with non-arrow predicate', () => {
    expect(() =>
      convert('({ loadedRecords }) => loadedRecords.some(checkFn)'),
    ).toThrow(JsonLogicConversionError);
  });
});

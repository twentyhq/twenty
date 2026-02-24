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

  return convertArrowFunctionToJsonLogic(arrowFunctions[0]);
};

describe('convertIncludesCallToJsonLogic', () => {
  it('converts property access .includes() to in operator', () => {
    expect(
      convert(
        '({ workflowWithCurrentVersion }) => workflowWithCurrentVersion.statuses.includes("ACTIVE")',
      ),
    ).toEqual({
      in: ['ACTIVE', { var: 'workflowWithCurrentVersion.statuses' }],
    });
  });

  it('converts inline array literal .includes() to in operator', () => {
    expect(
      convert(
        '({ selectedRecord }) => ["DRAFT", "ACTIVE"].includes(selectedRecord.status)',
      ),
    ).toEqual({
      in: [{ var: 'selectedRecord.status' }, ['DRAFT', 'ACTIVE']],
    });
  });

  it('converts local array variable .includes() to in operator', () => {
    expect(
      convert(
        `({ selectedRecord }) => {
          const statuses = ['NOT_STARTED', 'ENQUEUED'];
          return statuses.includes(selectedRecord.status);
        }`,
      ),
    ).toEqual({
      in: [{ var: 'selectedRecord.status' }, ['NOT_STARTED', 'ENQUEUED']],
    });
  });

  it('throws for .includes() on unsupported receiver', () => {
    expect(() =>
      convert(
        '({ selectedRecord }) => getStatuses().includes(selectedRecord.status)',
      ),
    ).toThrow(JsonLogicConversionError);
  });
});

import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertCallExpressionToJsonLogic } from '../utils/convert-call-expression-to-json-logic';

const getCallExpression = (code: string): Expression => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);

  return sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
    .getExpression();
};

describe('convertCallExpressionToJsonLogic', () => {
  describe('.includes()', () => {
    it('converts property.includes(value) to in operator', () => {
      expect(
        convertCallExpressionToJsonLogic({
          node: getCallExpression(
            'workflowWithCurrentVersion.statuses.includes("ACTIVE");',
          ),
        }),
      ).toEqual({
        in: ['ACTIVE', { var: 'workflowWithCurrentVersion.statuses' }],
      });
    });
  });

  describe('error cases', () => {
    it('throws for any identifier-based function call', () => {
      expect(() =>
        convertCallExpressionToJsonLogic({
          node: getCallExpression('isDefined(selectedRecord);'),
        }),
      ).toThrow(JsonLogicConversionError);
    });

    it('throws for unknown function calls', () => {
      expect(() =>
        convertCallExpressionToJsonLogic({
          node: getCallExpression('unknownFunction(a);'),
        }),
      ).toThrow(JsonLogicConversionError);
    });

    it('throws for non-call expression', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('temp.ts', 'a;');
      const expression = sourceFile
        .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
        .getExpression();

      expect(() =>
        convertCallExpressionToJsonLogic({ node: expression }),
      ).toThrow(JsonLogicConversionError);
    });

    it('throws for unsupported call expressions', () => {
      expect(() =>
        convertCallExpressionToJsonLogic({
          node: getCallExpression('obj.unknownMethod();'),
        }),
      ).toThrow(JsonLogicConversionError);
    });
  });
});

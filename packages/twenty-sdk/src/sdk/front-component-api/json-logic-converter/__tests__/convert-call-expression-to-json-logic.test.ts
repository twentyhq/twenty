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
  describe('isDefined', () => {
    it('converts isDefined(param) to isDefined operator', () => {
      expect(
        convertCallExpressionToJsonLogic(
          getCallExpression('isDefined(selectedRecord);'),
        ),
      ).toEqual({ isDefined: [{ var: 'selectedRecord' }] });
    });
  });

  describe('isNonEmptyString', () => {
    it('converts isNonEmptyString(param) to isNonEmptyString operator', () => {
      expect(
        convertCallExpressionToJsonLogic(
          getCallExpression('isNonEmptyString(name);'),
        ),
      ).toEqual({ isNonEmptyString: [{ var: 'name' }] });
    });
  });

  describe('Boolean', () => {
    it('converts Boolean(param) to !! operator', () => {
      expect(
        convertCallExpressionToJsonLogic(getCallExpression('Boolean(value);')),
      ).toEqual({ '!!': [{ var: 'value' }] });
    });
  });

  describe('known function calls', () => {
    it('converts getTargetObjectReadPermission to hasReadPermission', () => {
      expect(
        convertCallExpressionToJsonLogic(
          getCallExpression('getTargetObjectReadPermission("workflow");'),
        ),
      ).toEqual({ hasReadPermission: ['workflow'] });
    });
  });

  describe('.includes()', () => {
    it('converts property.includes(value) to in operator', () => {
      expect(
        convertCallExpressionToJsonLogic(
          getCallExpression(
            'workflowWithCurrentVersion.statuses.includes("ACTIVE");',
          ),
        ),
      ).toEqual({
        in: ['ACTIVE', { var: 'workflowWithCurrentVersion.statuses' }],
      });
    });
  });

  describe('error cases', () => {
    it('throws for unknown function calls', () => {
      expect(() =>
        convertCallExpressionToJsonLogic(
          getCallExpression('unknownFunction(a);'),
        ),
      ).toThrow(JsonLogicConversionError);
    });

    it('throws for non-call expression', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('temp.ts', 'a;');
      const expression = sourceFile
        .getFirstDescendantByKindOrThrow(SyntaxKind.ExpressionStatement)
        .getExpression();

      expect(() => convertCallExpressionToJsonLogic(expression)).toThrow(
        JsonLogicConversionError,
      );
    });

    it('throws for unsupported call expressions', () => {
      expect(() =>
        convertCallExpressionToJsonLogic(
          getCallExpression('obj.unknownMethod();'),
        ),
      ).toThrow(JsonLogicConversionError);
    });
  });
});

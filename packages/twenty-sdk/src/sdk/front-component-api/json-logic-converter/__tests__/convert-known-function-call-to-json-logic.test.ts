import { type Expression, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { convertKnownFunctionCallToJsonLogic } from '../utils/convert-known-function-call-to-json-logic';

const getExpressionArgs = (code: string): Expression[] => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', code);
  const callExpression = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.CallExpression,
  );

  return callExpression
    .getArguments()
    .filter(
      (argument): argument is Expression => argument.getKind() !== undefined,
    ) as Expression[];
};

describe('convertKnownFunctionCallToJsonLogic', () => {
  it('maps getTargetObjectReadPermission to hasReadPermission', () => {
    const args = getExpressionArgs(
      'getTargetObjectReadPermission("workflow");',
    );

    expect(
      convertKnownFunctionCallToJsonLogic(
        'getTargetObjectReadPermission',
        args,
      ),
    ).toEqual({ hasReadPermission: ['workflow'] });
  });

  it('maps getTargetObjectWritePermission to hasWritePermission', () => {
    const args = getExpressionArgs(
      'getTargetObjectWritePermission("workflow");',
    );

    expect(
      convertKnownFunctionCallToJsonLogic(
        'getTargetObjectWritePermission',
        args,
      ),
    ).toEqual({ hasWritePermission: ['workflow'] });
  });

  it('maps isFeatureFlagEnabled to isFeatureFlagEnabled', () => {
    const args = getExpressionArgs(
      'isFeatureFlagEnabled("IS_COMMAND_MENU_ITEM_ENABLED");',
    );

    expect(
      convertKnownFunctionCallToJsonLogic('isFeatureFlagEnabled', args),
    ).toEqual({ isFeatureFlagEnabled: ['IS_COMMAND_MENU_ITEM_ENABLED'] });
  });

  it('throws for unknown function names', () => {
    expect(() =>
      convertKnownFunctionCallToJsonLogic('unknownFunction', []),
    ).toThrow(JsonLogicConversionError);
  });

  it('throws when no arguments are provided', () => {
    expect(() =>
      convertKnownFunctionCallToJsonLogic('getTargetObjectReadPermission', []),
    ).toThrow(JsonLogicConversionError);
  });
});

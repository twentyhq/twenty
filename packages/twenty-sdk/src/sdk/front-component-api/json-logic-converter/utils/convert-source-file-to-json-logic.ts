import { type SourceFile, SyntaxKind } from 'ts-morph';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertArrowFunctionToJsonLogic } from './convert-arrow-function-to-json-logic';

export const convertSourceFileToJsonLogic = (
  sourceFile: SourceFile,
): JsonLogicRule => {
  const arrowFunctionNodes = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  if (!isNonEmptyArray(arrowFunctionNodes)) {
    throw new Error('No arrow function found in source');
  }

  return convertArrowFunctionToJsonLogic(arrowFunctionNodes[0]);
};

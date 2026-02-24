import { type SourceFile, SyntaxKind } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertArrowFunctionToJsonLogic } from './convert-arrow-function-to-json-logic';

export const convertSourceFileToJsonLogic = (
  sourceFile: SourceFile,
): JsonLogicRule => {
  const arrowFunctionNodes = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  const firstArrowFunction = arrowFunctionNodes[0];

  if (!isDefined(firstArrowFunction)) {
    throw new JsonLogicConversionError('No arrow function found in source');
  }

  return convertArrowFunctionToJsonLogic(firstArrowFunction);
};

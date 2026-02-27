import { type ArrowFunction, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertBlockBodyToJsonLogic } from './convert-block-body-to-json-logic';
import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';

export const convertArrowFunctionToJsonLogic = (
  node: ArrowFunction,
): JsonLogicRule => {
  const functionBody = node.getBody();

  if (Node.isBlock(functionBody)) {
    return convertBlockBodyToJsonLogic(functionBody);
  }

  if (!Node.isExpression(functionBody)) {
    throw new JsonLogicConversionError(
      `Unexpected arrow function body kind: ${functionBody.getKindName()} (${functionBody.getText()})`,
    );
  }

  return convertExpressionToJsonLogic(functionBody);
};

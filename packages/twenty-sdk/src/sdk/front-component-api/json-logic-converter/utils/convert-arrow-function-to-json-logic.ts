import { type ArrowFunction, type Expression, Node } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertBlockBodyToJsonLogic } from './convert-block-body-to-json-logic';
import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';

export const convertArrowFunctionToJsonLogic = (
  node: ArrowFunction,
): JsonLogicRule => {
  const functionBody = node.getBody();

  if (Node.isBlock(functionBody)) {
    return convertBlockBodyToJsonLogic(functionBody, new Map());
  }

  return convertExpressionToJsonLogic(functionBody as Expression);
};

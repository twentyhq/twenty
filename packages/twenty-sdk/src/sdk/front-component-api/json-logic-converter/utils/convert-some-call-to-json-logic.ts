import { type Expression, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';

export const convertSomeCallToJsonLogic = ({
  receiverExpression,
  predicateArgument,
}: {
  receiverExpression: Expression;
  predicateArgument: Expression;
}): JsonLogicRule => {
  const flattenedPropertyPath = flattenPropertyAccessToDotPath({
    node: receiverExpression,
  });

  if (!Node.isArrowFunction(predicateArgument)) {
    throw new JsonLogicConversionError(
      `Cannot handle .some() with non-arrow predicate: ${predicateArgument.getKindName()} (${predicateArgument.getText()})`,
    );
  }

  const predicateBodyExpression = predicateArgument.getBody();

  if (!Node.isExpression(predicateBodyExpression)) {
    throw new JsonLogicConversionError(
      `Unexpected .some() predicate body kind: ${predicateBodyExpression.getKindName()} (${predicateBodyExpression.getText()})`,
    );
  }

  return {
    some: [
      { var: flattenedPropertyPath },
      convertExpressionToJsonLogic({ node: predicateBodyExpression }),
    ],
  };
};

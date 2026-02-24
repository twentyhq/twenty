import { type Expression, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';

export const convertSomeCallToJsonLogic = (
  receiverExpression: Expression,
  predicateArgument: Expression,
): JsonLogicRule => {
  const flattenedPropertyPath =
    flattenPropertyAccessToDotPath(receiverExpression);

  if (!Node.isArrowFunction(predicateArgument)) {
    throw new JsonLogicConversionError(
      'Cannot handle .some() with non-arrow predicate',
      predicateArgument.getText(),
      predicateArgument.getKindName(),
    );
  }

  const predicateBodyExpression = predicateArgument.getBody();

  if (!Node.isExpression(predicateBodyExpression)) {
    throw new JsonLogicConversionError(
      'Unexpected .some() predicate body kind',
      predicateBodyExpression.getText(),
      predicateBodyExpression.getKindName(),
    );
  }

  return {
    some: [
      { var: flattenedPropertyPath },
      convertExpressionToJsonLogic(predicateBodyExpression),
    ],
  };
};

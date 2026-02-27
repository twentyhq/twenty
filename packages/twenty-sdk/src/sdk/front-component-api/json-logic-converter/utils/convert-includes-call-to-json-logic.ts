import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';
import { isKnownParamReference } from './is-known-param-reference';
import { resolveArrayLiteralElements } from './resolve-array-literal-elements';
import { resolveLocalArrayVariable } from './resolve-local-array-variable';

export const convertIncludesCallToJsonLogic = (
  receiverExpression: Expression,
  searchArgument: Expression,
): JsonLogicRule => {
  if (
    Node.isIdentifier(receiverExpression) &&
    !isKnownParamReference(receiverExpression.getText())
  ) {
    const resolvedArrayElements = resolveLocalArrayVariable(receiverExpression);

    if (isDefined(resolvedArrayElements)) {
      return {
        in: [
          convertExpressionToJsonLogic(searchArgument),
          resolvedArrayElements,
        ],
      };
    }
  }

  if (Node.isArrayLiteralExpression(receiverExpression)) {
    return {
      in: [
        convertExpressionToJsonLogic(searchArgument),
        resolveArrayLiteralElements(receiverExpression),
      ],
    };
  }

  const flattenedPropertyPath =
    flattenPropertyAccessToDotPath(receiverExpression);

  if (isKnownParamReference(flattenedPropertyPath)) {
    return {
      in: [
        convertExpressionToJsonLogic(searchArgument),
        { var: flattenedPropertyPath },
      ],
    };
  }

  throw new JsonLogicConversionError(
    `Cannot handle .includes() receiver: ${receiverExpression.getKindName()} (${receiverExpression.getText()})`,
  );
};

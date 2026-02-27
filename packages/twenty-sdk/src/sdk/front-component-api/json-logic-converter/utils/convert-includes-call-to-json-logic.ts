import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';
import { JsonLogicConversionError } from '../types/json-logic-conversion-error';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { getNestedFieldPath } from './get-nested-field-path';
import { isAllowedParameterInShouldBeRegistered } from './is-allowed-parameter-in-should-be-registered';
import { resolveArrayLiteralElements } from './resolve-array-literal-elements';
import { resolveLocalArrayVariable } from './resolve-local-array-variable';

export const convertIncludesCallToJsonLogic = ({
  receiverExpression,
  searchArgument,
}: {
  receiverExpression: Expression;
  searchArgument: Expression;
}): JsonLogicRule => {
  if (
    Node.isIdentifier(receiverExpression) &&
    !isAllowedParameterInShouldBeRegistered({
      name: receiverExpression.getText(),
    })
  ) {
    const resolvedArrayElements = resolveLocalArrayVariable({
      identifier: receiverExpression,
    });

    if (isDefined(resolvedArrayElements)) {
      return {
        in: [
          convertExpressionToJsonLogic({ node: searchArgument }),
          resolvedArrayElements,
        ],
      };
    }
  }

  if (Node.isArrayLiteralExpression(receiverExpression)) {
    return {
      in: [
        convertExpressionToJsonLogic({ node: searchArgument }),
        resolveArrayLiteralElements({ arrayLiteral: receiverExpression }),
      ],
    };
  }

  const nestedFieldPath = getNestedFieldPath({
    node: receiverExpression,
  });

  if (isAllowedParameterInShouldBeRegistered({ name: nestedFieldPath })) {
    return {
      in: [
        convertExpressionToJsonLogic({ node: searchArgument }),
        { var: nestedFieldPath },
      ],
    };
  }

  throw new JsonLogicConversionError(
    `Cannot handle .includes() receiver: ${receiverExpression.getKindName()} (${receiverExpression.getText()})`,
  );
};

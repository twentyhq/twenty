import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { convertKnownFunctionCallToJsonLogic } from './convert-known-function-call-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';
import { isKnownParamReference } from './is-known-param-reference';
import { resolveLocalArrayVariable } from './resolve-local-array-variable';
import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const convertCallExpressionToJsonLogic = (
  node: Expression,
): JsonLogicRule => {
  if (!Node.isCallExpression(node)) {
    throw new Error('Expected CallExpression');
  }

  const calleeExpression = node.getExpression();
  const callArguments = node.getArguments();

  if (Node.isIdentifier(calleeExpression)) {
    const functionName = calleeExpression.getText();

    switch (functionName) {
      case 'isDefined': {
        return {
          isDefined: [
            convertExpressionToJsonLogic(callArguments[0] as Expression),
          ],
        };
      }
      case 'isNonEmptyString': {
        return {
          isNonEmptyString: [
            convertExpressionToJsonLogic(callArguments[0] as Expression),
          ],
        };
      }
      case 'Boolean': {
        return {
          '!!': [convertExpressionToJsonLogic(callArguments[0] as Expression)],
        };
      }
      default: {
        if (isKnownParamReference(functionName)) {
          return convertKnownFunctionCallToJsonLogic(
            functionName,
            callArguments as Expression[],
          );
        }
        throw new Error(`Unknown function call: ${functionName}`);
      }
    }
  }

  if (Node.isPropertyAccessExpression(calleeExpression)) {
    const methodName = calleeExpression.getName();
    const receiverExpression = calleeExpression.getExpression();

    if (methodName === 'includes') {
      const receiverIdentifierText = receiverExpression.getText();

      if (
        Node.isIdentifier(receiverExpression) &&
        !isKnownParamReference(receiverIdentifierText)
      ) {
        const resolvedArrayElements =
          resolveLocalArrayVariable(receiverExpression);

        if (isDefined(resolvedArrayElements)) {
          return {
            in: [
              convertExpressionToJsonLogic(callArguments[0] as Expression),
              resolvedArrayElements,
            ],
          };
        }
      }

      if (Node.isArrayLiteralExpression(receiverExpression)) {
        const arrayLiteralElements = receiverExpression
          .getElements()
          .map((element) => {
            if (Node.isStringLiteral(element)) {
              return element.getLiteralValue();
            }
            const resolvedConstantValue = tryResolveKnownConstant(
              element.getText(),
            );

            if (isDefined(resolvedConstantValue)) {
              return resolvedConstantValue;
            }
            throw new Error(
              `Cannot resolve array element: ${element.getText()}`,
            );
          });

        return {
          in: [
            convertExpressionToJsonLogic(callArguments[0] as Expression),
            arrayLiteralElements,
          ],
        };
      }

      const flattenedPropertyPath =
        flattenPropertyAccessToDotPath(receiverExpression);

      if (isKnownParamReference(flattenedPropertyPath)) {
        return {
          in: [
            convertExpressionToJsonLogic(callArguments[0] as Expression),
            { var: flattenedPropertyPath },
          ],
        };
      }

      throw new Error(
        `Cannot handle .includes() on: ${receiverExpression.getText()}`,
      );
    }

    if (methodName === 'some') {
      const flattenedPropertyPath =
        flattenPropertyAccessToDotPath(receiverExpression);

      const predicateArgument = callArguments[0] as Expression;

      if (Node.isArrowFunction(predicateArgument)) {
        const predicateBodyExpression = predicateArgument.getBody();

        return {
          some: [
            { var: flattenedPropertyPath },
            convertExpressionToJsonLogic(predicateBodyExpression as Expression),
          ],
        };
      }

      throw new Error('Cannot handle .some() with non-arrow predicate');
    }

    if (
      Node.isIdentifier(receiverExpression) &&
      isKnownParamReference(methodName)
    ) {
      return convertKnownFunctionCallToJsonLogic(
        methodName,
        callArguments as Expression[],
      );
    }
  }

  if (
    Node.isIdentifier(calleeExpression) &&
    isKnownParamReference(calleeExpression.getText())
  ) {
    return convertKnownFunctionCallToJsonLogic(
      calleeExpression.getText(),
      callArguments as Expression[],
    );
  }

  throw new Error(`Unsupported call expression: ${node.getText()}`);
};

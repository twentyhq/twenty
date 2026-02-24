import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { convertIncludesCallToJsonLogic } from './convert-includes-call-to-json-logic';
import { convertKnownFunctionCallToJsonLogic } from './convert-known-function-call-to-json-logic';
import { convertSomeCallToJsonLogic } from './convert-some-call-to-json-logic';
import { isKnownParamReference } from './is-known-param-reference';

const getRequiredFirstArgument = (
  callArguments: Node[],
  context: string,
): Expression => {
  const firstArgument = callArguments[0];

  if (!isDefined(firstArgument)) {
    throw new JsonLogicConversionError(
      `Expected at least 1 argument for ${context}`,
    );
  }

  if (!Node.isExpression(firstArgument)) {
    throw new JsonLogicConversionError(
      `Expected expression argument for ${context}`,
      firstArgument.getText(),
      firstArgument.getKindName(),
    );
  }

  return firstArgument;
};

export const convertCallExpressionToJsonLogic = (
  node: Expression,
): JsonLogicRule => {
  if (!Node.isCallExpression(node)) {
    throw new JsonLogicConversionError(
      'Expected CallExpression',
      node.getText(),
      node.getKindName(),
    );
  }

  const calleeExpression = node.getExpression();
  const callArguments = node.getArguments();

  if (Node.isIdentifier(calleeExpression)) {
    const functionName = calleeExpression.getText();

    switch (functionName) {
      case 'isDefined': {
        const argument = getRequiredFirstArgument(callArguments, 'isDefined()');

        return { isDefined: [convertExpressionToJsonLogic(argument)] };
      }
      case 'isNonEmptyString': {
        const argument = getRequiredFirstArgument(
          callArguments,
          'isNonEmptyString()',
        );

        return {
          isNonEmptyString: [convertExpressionToJsonLogic(argument)],
        };
      }
      case 'Boolean': {
        const argument = getRequiredFirstArgument(callArguments, 'Boolean()');

        return { '!!': [convertExpressionToJsonLogic(argument)] };
      }
      default: {
        if (isKnownParamReference(functionName)) {
          const expressionArguments = callArguments.filter(
            (argument): argument is Expression => Node.isExpression(argument),
          );

          return convertKnownFunctionCallToJsonLogic(
            functionName,
            expressionArguments,
          );
        }
        throw new JsonLogicConversionError(
          `Unknown function call: ${functionName}`,
        );
      }
    }
  }

  if (Node.isPropertyAccessExpression(calleeExpression)) {
    const methodName = calleeExpression.getName();
    const receiverExpression = calleeExpression.getExpression();

    if (methodName === 'includes') {
      const searchArgument = getRequiredFirstArgument(
        callArguments,
        '.includes()',
      );

      return convertIncludesCallToJsonLogic(receiverExpression, searchArgument);
    }

    if (methodName === 'some') {
      const predicateArgument = getRequiredFirstArgument(
        callArguments,
        '.some()',
      );

      return convertSomeCallToJsonLogic(receiverExpression, predicateArgument);
    }

    if (
      Node.isIdentifier(receiverExpression) &&
      isKnownParamReference(methodName)
    ) {
      const expressionArguments = callArguments.filter(
        (argument): argument is Expression => Node.isExpression(argument),
      );

      return convertKnownFunctionCallToJsonLogic(
        methodName,
        expressionArguments,
      );
    }
  }

  throw new JsonLogicConversionError(
    'Unsupported call expression',
    node.getText(),
    node.getKindName(),
  );
};

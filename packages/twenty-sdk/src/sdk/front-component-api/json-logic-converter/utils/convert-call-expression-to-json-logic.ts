import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { convertIncludesCallToJsonLogic } from './convert-includes-call-to-json-logic';
import { convertKnownFunctionCallToJsonLogic } from './convert-known-function-call-to-json-logic';
import { convertSomeCallToJsonLogic } from './convert-some-call-to-json-logic';
import { isAllowedParameterInShouldBeRegistered } from './is-allowed-parameter-in-should-be-registered';

const getRequiredFirstArgument = ({
  callArguments,
  context,
}: {
  callArguments: Node[];
  context: string;
}): Expression => {
  const firstArgument = callArguments[0];

  if (!isDefined(firstArgument)) {
    throw new JsonLogicConversionError(
      `Expected at least 1 argument for ${context}`,
    );
  }

  if (!Node.isExpression(firstArgument)) {
    throw new JsonLogicConversionError(
      `Expected expression argument for ${context}, got ${firstArgument.getKindName()} (${firstArgument.getText()})`,
    );
  }

  return firstArgument;
};

export const convertCallExpressionToJsonLogic = ({
  node,
}: {
  node: Expression;
}): JsonLogicRule => {
  if (!Node.isCallExpression(node)) {
    throw new JsonLogicConversionError(
      `Expected CallExpression, got ${node.getKindName()} (${node.getText()})`,
    );
  }

  const calleeExpression = node.getExpression();
  const callArguments = node.getArguments();

  if (Node.isIdentifier(calleeExpression)) {
    const functionName = calleeExpression.getText();

    switch (functionName) {
      case 'isDefined': {
        const argument = getRequiredFirstArgument({
          callArguments,
          context: 'isDefined()',
        });

        return {
          isDefined: [convertExpressionToJsonLogic({ node: argument })],
        };
      }
      case 'isNonEmptyString': {
        const argument = getRequiredFirstArgument({
          callArguments,
          context: 'isNonEmptyString()',
        });

        return {
          isNonEmptyString: [convertExpressionToJsonLogic({ node: argument })],
        };
      }
      case 'Boolean': {
        const argument = getRequiredFirstArgument({
          callArguments,
          context: 'Boolean()',
        });

        return { '!!': [convertExpressionToJsonLogic({ node: argument })] };
      }
      default: {
        if (!isAllowedParameterInShouldBeRegistered({ name: functionName })) {
          throw new JsonLogicConversionError(
            `Unknown function call: ${functionName}`,
          );
        }

        const expressionArguments = callArguments.filter(
          (argument): argument is Expression => Node.isExpression(argument),
        );

        return convertKnownFunctionCallToJsonLogic({
          functionName,
          args: expressionArguments,
        });
      }
    }
  }

  if (Node.isPropertyAccessExpression(calleeExpression)) {
    const methodName = calleeExpression.getName();
    const receiverExpression = calleeExpression.getExpression();

    if (methodName === 'includes') {
      const searchArgument = getRequiredFirstArgument({
        callArguments,
        context: '.includes()',
      });

      return convertIncludesCallToJsonLogic({
        receiverExpression,
        searchArgument,
      });
    }

    if (methodName === 'some') {
      const predicateArgument = getRequiredFirstArgument({
        callArguments,
        context: '.some()',
      });

      return convertSomeCallToJsonLogic({
        receiverExpression,
        predicateArgument,
      });
    }

    if (
      Node.isIdentifier(receiverExpression) &&
      isAllowedParameterInShouldBeRegistered({ name: methodName })
    ) {
      const expressionArguments = callArguments.filter(
        (argument): argument is Expression => Node.isExpression(argument),
      );

      return convertKnownFunctionCallToJsonLogic({
        functionName: methodName,
        args: expressionArguments,
      });
    }
  }

  throw new JsonLogicConversionError(
    `Unsupported call expression: ${node.getKindName()} (${node.getText()})`,
  );
};

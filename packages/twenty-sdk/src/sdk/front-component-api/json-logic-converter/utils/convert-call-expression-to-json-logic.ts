import { type Expression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertIncludesCallToJsonLogic } from './convert-includes-call-to-json-logic';
import { convertSomeCallToJsonLogic } from './convert-some-call-to-json-logic';

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
    throw new JsonLogicConversionError(
      `Function calls are not supported in shouldBeRegistered: ${calleeExpression.getText()}(). Use explicit comparisons instead.`,
    );
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
  }

  throw new JsonLogicConversionError(
    `Unsupported call expression: ${node.getKindName()} (${node.getText()})`,
  );
};

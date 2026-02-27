import { type Expression, Node, SyntaxKind } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { extractJsonLogicOperands } from './extract-json-logic-operands';

export const convertBinaryExpressionToJsonLogic = ({
  node,
}: {
  node: Expression;
}): JsonLogicRule => {
  if (!Node.isBinaryExpression(node)) {
    throw new JsonLogicConversionError(
      `Expected BinaryExpression, got ${node.getKindName()} (${node.getText()})`,
    );
  }

  const leftOperand = node.getLeft();
  const operatorKind = node.getOperatorToken().getKind();
  const rightOperand = node.getRight();

  if (
    operatorKind === SyntaxKind.QuestionQuestionToken &&
    Node.isFalseLiteral(rightOperand)
  ) {
    return convertExpressionToJsonLogic({ node: leftOperand });
  }

  if (
    operatorKind === SyntaxKind.BarBarToken &&
    Node.isFalseLiteral(rightOperand)
  ) {
    return convertExpressionToJsonLogic({ node: leftOperand });
  }

  const convertedLeftExpression = convertExpressionToJsonLogic({
    node: leftOperand,
  });
  const convertedRightExpression = convertExpressionToJsonLogic({
    node: rightOperand,
  });

  switch (operatorKind) {
    case SyntaxKind.AmpersandAmpersandToken:
      return {
        and: [
          ...extractJsonLogicOperands({
            rule: convertedLeftExpression,
            operatorKey: 'and',
          }),
          ...extractJsonLogicOperands({
            rule: convertedRightExpression,
            operatorKey: 'and',
          }),
        ],
      };
    case SyntaxKind.BarBarToken:
      return {
        or: [
          ...extractJsonLogicOperands({
            rule: convertedLeftExpression,
            operatorKey: 'or',
          }),
          ...extractJsonLogicOperands({
            rule: convertedRightExpression,
            operatorKey: 'or',
          }),
        ],
      };
    case SyntaxKind.EqualsEqualsEqualsToken:
      return { '===': [convertedLeftExpression, convertedRightExpression] };
    case SyntaxKind.ExclamationEqualsEqualsToken:
      return { '!==': [convertedLeftExpression, convertedRightExpression] };
    case SyntaxKind.LessThanToken:
      return { '<': [convertedLeftExpression, convertedRightExpression] };
    case SyntaxKind.LessThanEqualsToken:
      return { '<=': [convertedLeftExpression, convertedRightExpression] };
    case SyntaxKind.GreaterThanToken:
      return { '>': [convertedLeftExpression, convertedRightExpression] };
    case SyntaxKind.GreaterThanEqualsToken:
      return { '>=': [convertedLeftExpression, convertedRightExpression] };
    default:
      throw new JsonLogicConversionError(
        `Unsupported binary operator: ${node.getOperatorToken().getText()} (${node.getText()})`,
      );
  }
};

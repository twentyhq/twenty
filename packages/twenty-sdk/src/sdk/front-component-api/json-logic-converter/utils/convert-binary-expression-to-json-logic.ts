import { type Expression, Node, SyntaxKind } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { extractJsonLogicOperands } from './extract-json-logic-operands';

export const convertBinaryExpressionToJsonLogic = (
  node: Expression,
): JsonLogicRule => {
  if (!Node.isBinaryExpression(node)) {
    throw new Error('Expected BinaryExpression');
  }

  const leftOperand = node.getLeft();
  const operatorKind = node.getOperatorToken().getKind();
  const rightOperand = node.getRight();

  if (
    operatorKind === SyntaxKind.QuestionQuestionToken &&
    Node.isFalseLiteral(rightOperand)
  ) {
    return convertExpressionToJsonLogic(leftOperand);
  }

  if (
    operatorKind === SyntaxKind.BarBarToken &&
    Node.isFalseLiteral(rightOperand)
  ) {
    return convertExpressionToJsonLogic(leftOperand);
  }

  const convertedLeftExpression = convertExpressionToJsonLogic(leftOperand);
  const convertedRightExpression = convertExpressionToJsonLogic(rightOperand);

  switch (operatorKind) {
    case SyntaxKind.AmpersandAmpersandToken:
      return {
        and: [
          ...extractJsonLogicOperands(convertedLeftExpression, 'and'),
          ...extractJsonLogicOperands(convertedRightExpression, 'and'),
        ],
      };
    case SyntaxKind.BarBarToken:
      return {
        or: [
          ...extractJsonLogicOperands(convertedLeftExpression, 'or'),
          ...extractJsonLogicOperands(convertedRightExpression, 'or'),
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
      throw new Error(
        `Unsupported binary operator: ${node.getOperatorToken().getText()}`,
      );
  }
};

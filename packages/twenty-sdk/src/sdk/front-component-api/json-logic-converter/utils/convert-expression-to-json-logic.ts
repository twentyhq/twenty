import { type Expression, Node, SyntaxKind } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertArrowFunctionToJsonLogic } from './convert-arrow-function-to-json-logic';
import { convertBinaryExpressionToJsonLogic } from './convert-binary-expression-to-json-logic';
import { convertCallExpressionToJsonLogic } from './convert-call-expression-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';
import { isKnownParamReference } from './is-known-param-reference';
import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const convertExpressionToJsonLogic = (
  node: Expression,
): JsonLogicRule => {
  if (
    Node.isParenthesizedExpression(node) ||
    Node.isAsExpression(node) ||
    Node.isNonNullExpression(node)
  ) {
    return convertExpressionToJsonLogic(node.getExpression());
  }

  if (Node.isTrueLiteral(node)) {
    return true;
  }

  if (Node.isFalseLiteral(node)) {
    return false;
  }

  if (Node.isNullLiteral(node)) {
    return null;
  }

  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }

  if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue();
  }

  if (Node.isIdentifier(node)) {
    const identifierName = node.getText();

    if (identifierName === 'undefined') {
      return null;
    }

    if (isKnownParamReference(identifierName)) {
      return { var: identifierName };
    }

    const resolvedConstantValue = tryResolveKnownConstant(identifierName);

    if (isDefined(resolvedConstantValue)) {
      return resolvedConstantValue;
    }

    return { var: identifierName };
  }

  if (Node.isPropertyAccessExpression(node)) {
    const flattenedPropertyPath = flattenPropertyAccessToDotPath(node);

    if (isKnownParamReference(flattenedPropertyPath)) {
      return { var: flattenedPropertyPath };
    }

    const resolvedConstantValue = tryResolveKnownConstant(
      flattenedPropertyPath,
    );

    if (isDefined(resolvedConstantValue)) {
      return resolvedConstantValue;
    }

    return { var: flattenedPropertyPath };
  }

  if (Node.isPrefixUnaryExpression(node)) {
    const prefixOperatorKind = node.getOperatorToken();

    if (prefixOperatorKind === SyntaxKind.ExclamationToken) {
      const unaryOperand = node.getOperand();

      return { '!': [convertExpressionToJsonLogic(unaryOperand)] };
    }

    throw new Error(`Unsupported prefix unary operator: ${prefixOperatorKind}`);
  }

  if (Node.isBinaryExpression(node)) {
    return convertBinaryExpressionToJsonLogic(node);
  }

  if (Node.isCallExpression(node)) {
    return convertCallExpressionToJsonLogic(node);
  }

  if (Node.isArrowFunction(node)) {
    return convertArrowFunctionToJsonLogic(node);
  }

  throw new Error(
    `Unsupported expression kind: ${node.getKindName()} — "${node.getText()}"`,
  );
};

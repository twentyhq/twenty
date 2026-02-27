import {
  type ArrowFunction,
  type Expression,
  type NumericLiteral,
  type ParenthesizedExpression,
  type PrefixUnaryExpression,
  type StringLiteral,
  SyntaxKind,
} from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertArrowFunctionToJsonLogic } from './convert-arrow-function-to-json-logic';
import { convertBinaryExpressionToJsonLogic } from './convert-binary-expression-to-json-logic';
import { convertCallExpressionToJsonLogic } from './convert-call-expression-to-json-logic';
import { flattenPropertyAccessToDotPath } from './flatten-property-access-to-dot-path';
import { isKnownParamReference } from './is-known-param-reference';
import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const convertExpressionToJsonLogic = ({
  node,
}: {
  node: Expression;
}): JsonLogicRule => {
  switch (node.getKind()) {
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.AsExpression:
    case SyntaxKind.NonNullExpression:
      return convertExpressionToJsonLogic({
        node: (node as ParenthesizedExpression).getExpression(),
      });

    case SyntaxKind.TrueKeyword:
      return true;

    case SyntaxKind.FalseKeyword:
      return false;

    case SyntaxKind.NullKeyword:
      return null;

    case SyntaxKind.StringLiteral:
      return (node as StringLiteral).getLiteralValue();

    case SyntaxKind.NumericLiteral:
      return (node as NumericLiteral).getLiteralValue();

    case SyntaxKind.Identifier: {
      const identifierName = node.getText();

      if (identifierName === 'undefined') {
        return null;
      }

      if (isKnownParamReference({ name: identifierName })) {
        return { var: identifierName };
      }

      const resolvedConstantValue = tryResolveKnownConstant({
        constantPath: identifierName,
      });

      if (isDefined(resolvedConstantValue)) {
        return resolvedConstantValue;
      }

      return { var: identifierName };
    }

    case SyntaxKind.PropertyAccessExpression: {
      const flattenedPropertyPath = flattenPropertyAccessToDotPath({ node });

      if (isKnownParamReference({ name: flattenedPropertyPath })) {
        return { var: flattenedPropertyPath };
      }

      const resolvedConstantValue = tryResolveKnownConstant({
        constantPath: flattenedPropertyPath,
      });

      if (isDefined(resolvedConstantValue)) {
        return resolvedConstantValue;
      }

      return { var: flattenedPropertyPath };
    }

    case SyntaxKind.PrefixUnaryExpression: {
      const prefixNode = node as PrefixUnaryExpression;
      const prefixOperatorKind = prefixNode.getOperatorToken();

      if (prefixOperatorKind === SyntaxKind.ExclamationToken) {
        return {
          '!': [
            convertExpressionToJsonLogic({ node: prefixNode.getOperand() }),
          ],
        };
      }

      throw new JsonLogicConversionError(
        `Unsupported prefix unary operator: ${prefixOperatorKind} (${node.getText()})`,
      );
    }

    case SyntaxKind.BinaryExpression:
      return convertBinaryExpressionToJsonLogic({ node });

    case SyntaxKind.CallExpression:
      return convertCallExpressionToJsonLogic({ node });

    case SyntaxKind.ArrowFunction:
      return convertArrowFunctionToJsonLogic({ node: node as ArrowFunction });

    default:
      throw new JsonLogicConversionError(
        `Unsupported expression kind: ${node.getKindName()} (${node.getText()})`,
      );
  }
};

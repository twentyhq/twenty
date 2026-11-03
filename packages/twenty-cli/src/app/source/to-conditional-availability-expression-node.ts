import { type ConditionalAvailabilityExpressionNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import ts from 'typescript';

export const toConditionalAvailabilityExpressionNode = ({
  node,
  sourceFile,
}: {
  node: ts.Expression;
  sourceFile: ts.SourceFile;
}): ConditionalAvailabilityExpressionNode => {
  const expression = node.getText(sourceFile);

  const convert = (
    childNode: ts.Expression,
  ): ConditionalAvailabilityExpressionNode => {
    const throwUnsupported = (reason: string): never => {
      throw new Error(
        `Cannot compile conditional availability expression "${expression}": unsupported ${reason} \`${childNode.getText(sourceFile)}\``,
      );
    };

    if (ts.isParenthesizedExpression(childNode)) {
      return convert(childNode.expression);
    }

    if (ts.isStringLiteral(childNode)) {
      return { kind: 'literal', value: childNode.text };
    }

    if (ts.isNumericLiteral(childNode)) {
      return { kind: 'literal', value: Number(childNode.text) };
    }

    if (childNode.kind === ts.SyntaxKind.TrueKeyword) {
      return { kind: 'literal', value: true };
    }

    if (childNode.kind === ts.SyntaxKind.FalseKeyword) {
      return { kind: 'literal', value: false };
    }

    if (ts.isIdentifier(childNode)) {
      return { kind: 'variable', name: childNode.text };
    }

    if (ts.isArrayLiteralExpression(childNode)) {
      return {
        kind: 'list',
        elements: childNode.elements.map((element) =>
          ts.isSpreadElement(element)
            ? throwUnsupported('spread element')
            : convert(element),
        ),
      };
    }

    if (ts.isPropertyAccessExpression(childNode)) {
      if (
        isDefined(childNode.questionDotToken) ||
        !ts.isIdentifier(childNode.name)
      ) {
        return throwUnsupported('optional or private member access');
      }

      return {
        kind: 'member',
        object: convert(childNode.expression),
        memberName: childNode.name.text,
      };
    }

    if (ts.isPrefixUnaryExpression(childNode)) {
      if (childNode.operator !== ts.SyntaxKind.ExclamationToken) {
        return throwUnsupported(
          `operator "${ts.tokenToString(childNode.operator)}"`,
        );
      }

      return { kind: 'not', operand: convert(childNode.operand) };
    }

    if (ts.isBinaryExpression(childNode)) {
      const left = convert(childNode.left);
      const right = convert(childNode.right);

      switch (childNode.operatorToken.kind) {
        case ts.SyntaxKind.AmpersandAmpersandToken:
          return { kind: 'logicalOperation', operator: 'and', left, right };
        case ts.SyntaxKind.BarBarToken:
          return { kind: 'logicalOperation', operator: 'or', left, right };
        case ts.SyntaxKind.EqualsEqualsEqualsToken:
        case ts.SyntaxKind.EqualsEqualsToken:
          return { kind: 'comparison', operator: '==', left, right };
        case ts.SyntaxKind.ExclamationEqualsEqualsToken:
        case ts.SyntaxKind.ExclamationEqualsToken:
          return { kind: 'comparison', operator: '!=', left, right };
        case ts.SyntaxKind.LessThanToken:
          return { kind: 'comparison', operator: '<', left, right };
        case ts.SyntaxKind.LessThanEqualsToken:
          return { kind: 'comparison', operator: '<=', left, right };
        case ts.SyntaxKind.GreaterThanToken:
          return { kind: 'comparison', operator: '>', left, right };
        case ts.SyntaxKind.GreaterThanEqualsToken:
          return { kind: 'comparison', operator: '>=', left, right };
        default:
          return throwUnsupported(
            `operator "${childNode.operatorToken.getText(sourceFile)}"`,
          );
      }
    }

    if (ts.isCallExpression(childNode)) {
      if (
        !ts.isIdentifier(childNode.expression) ||
        isDefined(childNode.questionDotToken)
      ) {
        return throwUnsupported('call');
      }

      return {
        kind: 'functionCall',
        functionName: childNode.expression.text,
        functionArguments: childNode.arguments.map((argument) =>
          ts.isSpreadElement(argument)
            ? throwUnsupported('spread argument')
            : convert(argument),
        ),
      };
    }

    return throwUnsupported(`syntax ${ts.SyntaxKind[childNode.kind]}`);
  };

  return convert(node);
};

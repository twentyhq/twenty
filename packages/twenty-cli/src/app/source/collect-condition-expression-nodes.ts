import ts from 'typescript';

import { CONDITION_EXPRESSION_PROPERTY_NAMES } from '@/app/source/constants/condition-expression-property-names.constant';

export const collectConditionExpressionNodes = (
  sourceFile: ts.SourceFile,
): ts.Expression[] => {
  const expressionNodes: ts.Expression[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      CONDITION_EXPRESSION_PROPERTY_NAMES.includes(node.name.text) &&
      !ts.isStringLiteralLike(node.initializer)
    ) {
      expressionNodes.push(node.initializer);

      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return expressionNodes;
};

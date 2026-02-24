import { Node, SyntaxKind } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const resolveLocalArrayVariable = (
  identifier: Node,
): JsonLogicRule[] | undefined => {
  if (!Node.isIdentifier(identifier)) {
    return undefined;
  }

  const identifierName = identifier.getText();
  const sourceFile = identifier.getSourceFile();
  const enclosingScope = identifier.getParentWhile(
    (_, child) => !Node.isBlock(child) && !Node.isSourceFile(child),
  );
  const nodeToSearchIn = enclosingScope ?? sourceFile;

  const variableDeclarationsInScope = nodeToSearchIn.getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  );

  const matchingDeclaration = variableDeclarationsInScope.find(
    (variableDeclaration) => variableDeclaration.getName() === identifierName,
  );

  const initializer = matchingDeclaration?.getInitializer();

  if (!initializer || !Node.isArrayLiteralExpression(initializer)) {
    return undefined;
  }

  return initializer.getElements().map((element) => {
    if (Node.isStringLiteral(element)) {
      return element.getLiteralValue();
    }

    if (Node.isNumericLiteral(element)) {
      return element.getLiteralValue();
    }

    const resolvedConstantValue = tryResolveKnownConstant(element.getText());

    if (isDefined(resolvedConstantValue)) {
      return resolvedConstantValue;
    }

    throw new Error(`Cannot resolve array element: ${element.getText()}`);
  });
};

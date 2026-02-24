import { Node, SyntaxKind } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { resolveArrayLiteralElements } from './resolve-array-literal-elements';

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

  return resolveArrayLiteralElements(initializer);
};

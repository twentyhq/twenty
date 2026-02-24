import { type Expression, Node } from 'ts-morph';

export const flattenPropertyAccessToDotPath = (node: Expression): string => {
  if (Node.isIdentifier(node)) {
    return node.getText();
  }

  if (Node.isPropertyAccessExpression(node)) {
    const objectPath = flattenPropertyAccessToDotPath(node.getExpression());
    const propertyName = node.getName();

    return `${objectPath}.${propertyName}`;
  }

  if (Node.isNonNullExpression(node)) {
    return flattenPropertyAccessToDotPath(node.getExpression());
  }

  throw new Error(
    `Cannot flatten property access for node kind: ${node.getKindName()} — "${node.getText()}"`,
  );
};

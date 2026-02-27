import { type Expression, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';

export const flattenPropertyAccessToDotPath = ({
  node,
}: {
  node: Expression;
}): string => {
  if (Node.isIdentifier(node)) {
    return node.getText();
  }

  if (Node.isPropertyAccessExpression(node)) {
    const objectPath = flattenPropertyAccessToDotPath({
      node: node.getExpression(),
    });
    const propertyName = node.getName();

    return `${objectPath}.${propertyName}`;
  }

  if (Node.isNonNullExpression(node)) {
    return flattenPropertyAccessToDotPath({ node: node.getExpression() });
  }

  throw new JsonLogicConversionError(
    `Cannot flatten property access: ${node.getKindName()} (${node.getText()})`,
  );
};

import { isDefined } from 'twenty-shared/utils';

export const readComputedStyleProperties = ({
  node,
  propertyNames,
}: {
  node: Element;
  propertyNames: readonly string[];
}): Record<string, string> => {
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node);

  if (!isDefined(computedStyle)) {
    return {};
  }

  const values: Record<string, string> = {};
  for (const propertyName of propertyNames) {
    values[propertyName] = computedStyle.getPropertyValue(propertyName);
  }
  return values;
};

import { isNonEmptyArray, isNonEmptyString } from 'twenty-shared/utils';

export const getStaticStringValue = (node: any): string | undefined => {
  if (node?.type === 'Literal' && isNonEmptyString(node.value)) {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && !isNonEmptyArray(node.expressions)) {
    return node.quasis[0].value.cooked;
  }

  return undefined;
};

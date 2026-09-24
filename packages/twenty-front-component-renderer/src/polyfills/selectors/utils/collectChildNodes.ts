import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const collectChildNodes = (
  node: SelectorElementLike,
): SelectorElementLike[] => {
  const childNodes = node.childNodes ?? [];
  const children: SelectorElementLike[] = [];

  for (let index = 0; index < childNodes.length; index += 1) {
    const child = childNodes[index];

    if (isObject(child)) {
      children.push(child as SelectorElementLike);
    }
  }

  return children;
};

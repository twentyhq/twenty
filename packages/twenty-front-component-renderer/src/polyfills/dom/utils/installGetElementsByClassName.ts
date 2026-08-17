import { isNonEmptyString } from '@sniptt/guards';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { resolveClassAttributeValue } from '@/polyfills/dom/utils/resolveClassAttributeValue';

const hasEveryClassNameToken = (
  element: ElementLike,
  classNameTokens: string[],
): boolean => {
  const classNameValue = resolveClassAttributeValue(element);

  if (!isNonEmptyString(classNameValue)) {
    return false;
  }

  const elementTokens = classNameValue.split(/\s+/);

  return classNameTokens.every((classNameToken) =>
    elementTokens.includes(classNameToken),
  );
};

export const installGetElementsByClassName = (installTarget: object): void => {
  Object.defineProperty(installTarget, 'getElementsByClassName', {
    value: function (this: ElementLike, classNames: string) {
      const classNameTokens = String(classNames)
        .split(/\s+/)
        .filter(isNonEmptyString);

      const matches: ElementLike[] = [];

      if (classNameTokens.length > 0) {
        for (const currentNode of iterateElementSubtree(this)) {
          if (
            currentNode !== this &&
            hasEveryClassNameToken(currentNode, classNameTokens)
          ) {
            matches.push(currentNode);
          }
        }
      }

      return Object.assign(matches, {
        item: (index: number) => matches[index] ?? null,
      });
    },
    configurable: true,
    writable: true,
  });
};

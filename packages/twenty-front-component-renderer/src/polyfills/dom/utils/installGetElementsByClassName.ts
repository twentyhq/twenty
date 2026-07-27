import { isFunction, isNonEmptyString } from '@sniptt/guards';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';

const resolveClassNameValue = (element: ElementLike): string | null => {
  if (isFunction(element.getAttribute)) {
    const classAttribute = element.getAttribute('class');

    if (isNonEmptyString(classAttribute)) {
      return classAttribute;
    }
  }

  const reflectedClassName = (element as ElementLike & { className?: unknown })
    .className;

  return isNonEmptyString(reflectedClassName) ? reflectedClassName : null;
};

const hasEveryClassNameToken = (
  element: ElementLike,
  classNameTokens: string[],
): boolean => {
  const classNameValue = resolveClassNameValue(element);

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

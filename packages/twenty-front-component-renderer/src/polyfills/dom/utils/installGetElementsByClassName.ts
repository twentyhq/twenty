import { isFunction, isNonEmptyString, isString } from '@sniptt/guards';

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

const collectMatchesInTreeOrder = (
  rootElement: ElementLike,
  classNameTokens: string[],
): ElementLike[] => {
  const matches: ElementLike[] = [];

  if (classNameTokens.length === 0) {
    return matches;
  }

  for (const currentNode of iterateElementSubtree(rootElement)) {
    if (
      currentNode !== rootElement &&
      hasEveryClassNameToken(currentNode, classNameTokens)
    ) {
      matches.push(currentNode);
    }
  }

  return matches;
};

const createLiveClassNameCollection = (
  rootElement: ElementLike,
  classNameTokens: string[],
): object => {
  const query = () => collectMatchesInTreeOrder(rootElement, classNameTokens);

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (property === 'length') {
          return query().length;
        }

        if (property === 'item') {
          return (index: number) => query()[index] ?? null;
        }

        if (property === Symbol.iterator) {
          return function* () {
            yield* query();
          };
        }

        if (isString(property) && /^\d+$/.test(property)) {
          return query()[Number(property)];
        }

        return undefined;
      },
      has: (_target, property) => {
        if (property === 'length' || property === 'item') {
          return true;
        }

        if (isString(property) && /^\d+$/.test(property)) {
          return Number(property) < query().length;
        }

        return false;
      },
    },
  );
};

export const installGetElementsByClassName = (installTarget: object): void => {
  Object.defineProperty(installTarget, 'getElementsByClassName', {
    value: function (this: ElementLike, classNames: string) {
      const classNameTokens = String(classNames)
        .split(/\s+/)
        .filter(isNonEmptyString);

      return createLiveClassNameCollection(this, classNameTokens);
    },
    configurable: true,
    writable: true,
  });
};

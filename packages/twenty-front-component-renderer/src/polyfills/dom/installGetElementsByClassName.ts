import { isNonEmptyString } from '@sniptt/guards';

type ElementLike = {
  childNodes?: ArrayLike<unknown>;
  getAttribute?: (attributeName: string) => string | null;
};

const hasEveryClassNameToken = (
  element: ElementLike,
  classNameTokens: string[],
): boolean => {
  if (typeof element.getAttribute !== 'function') {
    return false;
  }

  const classAttribute = element.getAttribute('class');

  if (!isNonEmptyString(classAttribute)) {
    return false;
  }

  const elementTokens = classAttribute.split(/\s+/);

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

  const pendingNodes: ElementLike[] = [rootElement];

  while (pendingNodes.length > 0) {
    const currentNode = pendingNodes.pop() as ElementLike;

    if (
      currentNode !== rootElement &&
      hasEveryClassNameToken(currentNode, classNameTokens)
    ) {
      matches.push(currentNode);
    }

    const childNodes = currentNode.childNodes;

    if (childNodes !== undefined) {
      for (let index = childNodes.length - 1; index >= 0; index -= 1) {
        pendingNodes.push(childNodes[index] as ElementLike);
      }
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

        if (typeof property === 'string' && /^\d+$/.test(property)) {
          return query()[Number(property)];
        }

        return undefined;
      },
      has: (_target, property) => {
        if (property === 'length' || property === 'item') {
          return true;
        }

        if (typeof property === 'string' && /^\d+$/.test(property)) {
          return Number(property) < query().length;
        }

        return false;
      },
    },
  );
};

export const installGetElementsByClassName = (
  elementPrototype: object,
): void => {
  Object.defineProperty(elementPrototype, 'getElementsByClassName', {
    value: function (this: ElementLike, classNames: string) {
      const classNameTokens = String(classNames)
        .split(/\s+/)
        .filter((classNameToken) => classNameToken.length > 0);

      return createLiveClassNameCollection(this, classNameTokens);
    },
    configurable: true,
    writable: true,
  });
};

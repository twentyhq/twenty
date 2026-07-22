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

export const installGetElementsByClassName = (
  elementPrototype: object,
): void => {
  Object.defineProperty(elementPrototype, 'getElementsByClassName', {
    value: function (this: ElementLike, classNames: string) {
      const classNameTokens = String(classNames)
        .split(/\s+/)
        .filter((classNameToken) => classNameToken.length > 0);

      const matches: ElementLike[] = [];

      if (classNameTokens.length === 0) {
        return matches;
      }

      const pendingNodes: ElementLike[] = [this];

      while (pendingNodes.length > 0) {
        const currentNode = pendingNodes.shift() as ElementLike;

        if (
          currentNode !== this &&
          hasEveryClassNameToken(currentNode, classNameTokens)
        ) {
          matches.push(currentNode);
        }

        const childNodes = currentNode.childNodes;

        if (childNodes !== undefined) {
          for (let index = 0; index < childNodes.length; index += 1) {
            pendingNodes.push(childNodes[index] as ElementLike);
          }
        }
      }

      const matchesWithItem = matches as ElementLike[] & {
        item: (index: number) => ElementLike | null;
      };
      matchesWithItem.item = (index: number) => matchesWithItem[index] ?? null;

      return matchesWithItem;
    },
    configurable: true,
    writable: true,
  });
};

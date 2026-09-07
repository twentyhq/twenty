import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';
import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';

const hasEveryClassToken = (
  element: ElementLike,
  classTokens: string[],
): boolean => {
  const elementTokens = (element.getAttribute?.('class') ?? '').split(
    ASCII_WHITESPACE_REGEX,
  );

  return classTokens.every((classToken) => elementTokens.includes(classToken));
};

export const installGetElementsByClassName = (installTarget: object): void => {
  Object.defineProperty(installTarget, 'getElementsByClassName', {
    value: function (this: ElementLike, classNames: string) {
      const classTokens = parseClassTokenList(String(classNames));

      const matches: ElementLike[] = [];

      if (classTokens.length > 0) {
        for (const currentNode of iterateElementSubtree(this)) {
          if (
            currentNode !== this &&
            hasEveryClassToken(currentNode, classTokens)
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

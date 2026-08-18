import { type ClassListTargetElement } from '@/polyfills/dom/types/ClassListTargetElement';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';
import { toValidClassTokenOrThrow } from '@/polyfills/dom/utils/toValidClassTokenOrThrow';

export const createClassTokenList = (
  element: ClassListTargetElement,
): WorkerClassTokenList => {
  let memoizedClassAttributeValue: string | null = null;
  let memoizedTokens: string[] = [];

  const parseTokensMemoized = (
    classAttributeValue: string | null,
  ): string[] => {
    if (classAttributeValue !== memoizedClassAttributeValue) {
      memoizedClassAttributeValue = classAttributeValue;
      memoizedTokens = parseClassTokenList(classAttributeValue ?? '');
    }

    return memoizedTokens;
  };

  const readCurrentTokens = (): string[] =>
    parseTokensMemoized(element.getAttribute('class'));

  // Unlike browsers, unchanged writes are skipped to avoid cross-thread host mutations
  const writeTokens = (
    classAttributeValue: string | null,
    tokens: string[],
  ): void => {
    const updatedClassAttributeValue = tokens.join(' ');

    const isAbsentAndEmpty =
      classAttributeValue === null && tokens.length === 0;
    const isUnchanged = updatedClassAttributeValue === classAttributeValue;

    if (isAbsentAndEmpty || isUnchanged) {
      return;
    }

    element.setAttribute('class', updatedClassAttributeValue);
  };

  const classTokenList: WorkerClassTokenList = {
    get length() {
      return readCurrentTokens().length;
    },
    get value() {
      return element.getAttribute('class') ?? '';
    },
    set value(newValue: string) {
      element.setAttribute('class', newValue);
    },
    add: (...tokens) => {
      const tokensToAdd = tokens.map(toValidClassTokenOrThrow);

      const classAttributeValue = element.getAttribute('class');
      const currentTokens = parseTokensMemoized(classAttributeValue);

      writeTokens(classAttributeValue, [
        ...new Set([...currentTokens, ...tokensToAdd]),
      ]);
    },
    remove: (...tokens) => {
      const tokensToRemove = tokens.map(toValidClassTokenOrThrow);

      const classAttributeValue = element.getAttribute('class');

      const remainingTokens = parseTokensMemoized(classAttributeValue).filter(
        (currentToken) => !tokensToRemove.includes(currentToken),
      );

      writeTokens(classAttributeValue, remainingTokens);
    },
    toggle: (token, force) => {
      const tokenToToggle = toValidClassTokenOrThrow(token);

      const shouldBePresent =
        force ?? !readCurrentTokens().includes(tokenToToggle);

      if (shouldBePresent) {
        classTokenList.add(tokenToToggle);

        return true;
      }

      classTokenList.remove(tokenToToggle);

      return false;
    },
    replace: (oldToken, newToken) => {
      const oldTokenToReplace = toValidClassTokenOrThrow(oldToken);
      const newTokenToInsert = toValidClassTokenOrThrow(newToken);

      const classAttributeValue = element.getAttribute('class');
      const currentTokens = parseTokensMemoized(classAttributeValue);

      if (!currentTokens.includes(oldTokenToReplace)) {
        return false;
      }

      const updatedTokens = [
        ...new Set(
          currentTokens.map((currentToken) =>
            currentToken === oldTokenToReplace
              ? newTokenToInsert
              : currentToken,
          ),
        ),
      ];

      writeTokens(classAttributeValue, updatedTokens);

      return true;
    },
    contains: (token) => readCurrentTokens().includes(String(token)),
    item: (index) => readCurrentTokens()[index] ?? null,
    supports: () => {
      throw new TypeError(
        "Failed to execute 'supports': the class attribute has no supported tokens.",
      );
    },
    forEach: (callback, thisArg) => {
      for (const [tokenIndex, token] of readCurrentTokens().entries()) {
        callback.call(thisArg, token, tokenIndex, classTokenList);
      }
    },
    entries: () => readCurrentTokens().entries(),
    keys: () => readCurrentTokens().keys(),
    values: () => readCurrentTokens().values(),
    toString: () => element.getAttribute('class') ?? '',
    [Symbol.iterator]: () => readCurrentTokens().values(),
  };

  return classTokenList;
};

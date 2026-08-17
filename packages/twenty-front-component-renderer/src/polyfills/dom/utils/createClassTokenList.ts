import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ElementWithClassAttribute } from '@/polyfills/dom/types/ElementWithClassAttribute';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';
import { replaceClassToken } from '@/polyfills/dom/utils/replaceClassToken';
import { resolveClassAttributeValue } from '@/polyfills/dom/utils/resolveClassAttributeValue';
import { toValidClassTokenOrThrow } from '@/polyfills/dom/utils/toValidClassTokenOrThrow';

export const createClassTokenList = (
  element: ElementWithClassAttribute,
): WorkerClassTokenList => {
  const readClassAttributeValue = (): string | null =>
    resolveClassAttributeValue(element);

  const readCurrentTokens = (): string[] =>
    parseClassTokenList(readClassAttributeValue() ?? '');

  const writeClassAttributeValue = (classAttributeValue: string): void => {
    if (isFunction(element.setAttribute)) {
      element.setAttribute('class', classAttributeValue);
    }
  };

  const writeTokens = (tokens: string[]): void => {
    const shouldSkipCreatingEmptyClassAttribute =
      !isDefined(readClassAttributeValue()) && tokens.length === 0;

    if (shouldSkipCreatingEmptyClassAttribute) {
      return;
    }

    writeClassAttributeValue(tokens.join(' '));
  };

  const classTokenList: WorkerClassTokenList = {
    get length() {
      return readCurrentTokens().length;
    },
    get value() {
      return readClassAttributeValue() ?? '';
    },
    set value(newValue: string) {
      writeClassAttributeValue(String(newValue));
    },
    add: (...tokens) => {
      const tokensToAdd = tokens.map((token) =>
        toValidClassTokenOrThrow(token),
      );

      const updatedTokens = [...readCurrentTokens()];

      for (const tokenToAdd of tokensToAdd) {
        if (!updatedTokens.includes(tokenToAdd)) {
          updatedTokens.push(tokenToAdd);
        }
      }

      writeTokens(updatedTokens);
    },
    remove: (...tokens) => {
      const tokensToRemove = tokens.map((token) =>
        toValidClassTokenOrThrow(token),
      );

      const remainingTokens = readCurrentTokens().filter(
        (currentToken) => !tokensToRemove.includes(currentToken),
      );

      writeTokens(remainingTokens);
    },
    toggle: (token, force) => {
      const tokenToToggle = toValidClassTokenOrThrow(token);

      const currentTokens = readCurrentTokens();
      const isTokenPresent = currentTokens.includes(tokenToToggle);

      if (isTokenPresent && force === true) {
        return true;
      }

      if (!isTokenPresent && force === false) {
        return false;
      }

      if (isTokenPresent) {
        writeTokens(
          currentTokens.filter(
            (currentToken) => currentToken !== tokenToToggle,
          ),
        );

        return false;
      }

      writeTokens([...currentTokens, tokenToToggle]);

      return true;
    },
    replace: (oldToken, newToken) => {
      const oldTokenToReplace = toValidClassTokenOrThrow(oldToken);
      const newTokenToInsert = toValidClassTokenOrThrow(newToken);

      const currentTokens = readCurrentTokens();

      if (!currentTokens.includes(oldTokenToReplace)) {
        return false;
      }

      writeTokens(
        replaceClassToken({
          currentTokens,
          oldToken: oldTokenToReplace,
          newToken: newTokenToInsert,
        }),
      );

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
      let tokenIndex = 0;

      for (const token of readCurrentTokens()) {
        callback.call(thisArg, token, tokenIndex, classTokenList);
        tokenIndex += 1;
      }
    },
    *entries() {
      yield* readCurrentTokens().entries();
    },
    *keys() {
      yield* readCurrentTokens().keys();
    },
    *values() {
      yield* readCurrentTokens().values();
    },
    toString: () => readClassAttributeValue() ?? '',
    *[Symbol.iterator]() {
      yield* readCurrentTokens().values();
    },
  };

  return classTokenList;
};

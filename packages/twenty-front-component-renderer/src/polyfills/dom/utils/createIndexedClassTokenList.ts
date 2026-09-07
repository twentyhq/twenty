import { isDefined } from 'twenty-shared/utils';

import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';

const MAX_ARRAY_INDEX = 2 ** 32 - 2;

const parseIndexPropertyKey = (property: string | symbol): number | null => {
  if (typeof property !== 'string') {
    return null;
  }

  const tokenIndex = Number(property);

  const isCanonicalIndexKey =
    Number.isInteger(tokenIndex) &&
    tokenIndex >= 0 &&
    tokenIndex <= MAX_ARRAY_INDEX &&
    String(tokenIndex) === property;

  return isCanonicalIndexKey ? tokenIndex : null;
};

// A DOMTokenList exposes its tokens as numeric properties, and only a proxy can
// serve those from a live class attribute read
export const createIndexedClassTokenList = (
  classTokenList: WorkerClassTokenList,
): WorkerClassTokenList =>
  new Proxy(classTokenList, {
    get: (tokenList, property, receiver) => {
      const tokenIndex = parseIndexPropertyKey(property);

      return isDefined(tokenIndex)
        ? (tokenList.item(tokenIndex) ?? undefined)
        : Reflect.get(tokenList, property, receiver);
    },
    has: (tokenList, property) => {
      const tokenIndex = parseIndexPropertyKey(property);

      return isDefined(tokenIndex)
        ? tokenIndex < tokenList.length
        : Reflect.has(tokenList, property);
    },
    getOwnPropertyDescriptor: (tokenList, property) => {
      const tokenIndex = parseIndexPropertyKey(property);

      if (!isDefined(tokenIndex)) {
        return Reflect.getOwnPropertyDescriptor(tokenList, property);
      }

      const token = tokenList.item(tokenIndex);

      if (token === null) {
        return undefined;
      }

      return {
        value: token,
        writable: false,
        enumerable: true,
        configurable: true,
      };
    },
    defineProperty: (tokenList, property, descriptor) =>
      isDefined(parseIndexPropertyKey(property))
        ? false
        : Reflect.defineProperty(tokenList, property, descriptor),
    ownKeys: (tokenList) => [
      ...Array.from({ length: tokenList.length }, (_, tokenIndex) =>
        String(tokenIndex),
      ),
      ...Reflect.ownKeys(tokenList),
    ],
  });

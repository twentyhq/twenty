import { isDefined } from 'twenty-shared/utils';

import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';

const toTokenIndexFromPropertyKey = (
  property: string | symbol,
): number | null => {
  if (typeof property !== 'string') {
    return null;
  }

  const tokenIndex = Number(property);

  const isCanonicalIndexKey =
    Number.isInteger(tokenIndex) &&
    tokenIndex >= 0 &&
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
      const tokenIndex = toTokenIndexFromPropertyKey(property);

      return isDefined(tokenIndex)
        ? (tokenList.item(tokenIndex) ?? undefined)
        : Reflect.get(tokenList, property, receiver);
    },
    has: (tokenList, property) => {
      const tokenIndex = toTokenIndexFromPropertyKey(property);

      return isDefined(tokenIndex)
        ? tokenIndex < tokenList.length
        : Reflect.has(tokenList, property);
    },
    getOwnPropertyDescriptor: (tokenList, property) => {
      const tokenIndex = toTokenIndexFromPropertyKey(property);

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
    ownKeys: (tokenList) => [
      ...Array.from({ length: tokenList.length }, (_, tokenIndex) =>
        String(tokenIndex),
      ),
      ...Reflect.ownKeys(tokenList),
    ],
  });

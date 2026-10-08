import { isNonNegativeInteger, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';

const MAX_ARRAY_INDEX = 2 ** 32 - 2;

const parseIndexPropertyKey = (property: string | symbol): number | null => {
  if (!isString(property)) {
    return null;
  }

  const tokenIndex = Number(property);

  const isCanonicalIndexKey =
    isNonNegativeInteger(tokenIndex) &&
    tokenIndex <= MAX_ARRAY_INDEX &&
    String(tokenIndex) === property;

  return isCanonicalIndexKey ? tokenIndex : null;
};

const INDEXED_CLASS_TOKEN_LIST_PROXY_HANDLER: ProxyHandler<WorkerClassTokenList> =
  {
    get: (tokenList, property, receiver) => {
      const tokenIndex = parseIndexPropertyKey(property);

      return isDefined(tokenIndex)
        ? (tokenList.item(tokenIndex) ?? undefined)
        : Reflect.get(tokenList, property, receiver);
    },
    has: (tokenList, property) => {
      const tokenIndex = parseIndexPropertyKey(property);

      return isDefined(tokenIndex)
        ? tokenList.item(tokenIndex) !== null
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
      ...Array.from(tokenList.keys(), String),
      ...Reflect.ownKeys(tokenList),
    ],
  };

export const createIndexedClassTokenList = (
  classTokenList: WorkerClassTokenList,
): WorkerClassTokenList =>
  new Proxy(classTokenList, INDEXED_CLASS_TOKEN_LIST_PROXY_HANDLER);

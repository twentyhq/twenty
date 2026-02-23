import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import { cookieStorage } from '~/utils/cookie-storage';

type CookieAttributesLike = {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
};

const hasCustomCookieAttributes = (
  value: unknown,
): value is { cookieAttributes: CookieAttributesLike } =>
  isDefined(value) &&
  typeof value === 'object' &&
  value !== null &&
  'cookieAttributes' in value &&
  isDefined((value as Record<string, unknown>).cookieAttributes);

type JotaiSyncStorage<ValueType> = {
  getItem: (key: string, initialValue: ValueType) => ValueType;
  setItem: (key: string, newValue: ValueType) => void;
  removeItem: (key: string) => void;
};

export const createJotaiCookieStorage = <ValueType>({
  cookieKey,
  attributes,
  validateInitFn,
}: {
  cookieKey: string;
  attributes?: CookieAttributesLike;
  validateInitFn?: (payload: NonNullable<ValueType>) => boolean;
}): JotaiSyncStorage<ValueType> => {
  const defaultAttributes = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
    ...(attributes ?? {}),
  };

  return {
    getItem: (key: string, initialValue: ValueType): ValueType => {
      const savedValue = cookieStorage.getItem(cookieKey);

      if (!isDefined(savedValue) || savedValue.length === 0) {
        return initialValue;
      }

      try {
        const parsed = JSON.parse(savedValue);

        if (isDefined(validateInitFn) && !validateInitFn(parsed)) {
          return initialValue;
        }

        return parsed as ValueType;
      } catch {
        return initialValue;
      }
    },
    setItem: (key: string, newValue: ValueType): void => {
      const cookieAttrs = {
        ...defaultAttributes,
        ...(hasCustomCookieAttributes(newValue)
          ? newValue.cookieAttributes
          : {}),
      };

      const valueToStore = hasCustomCookieAttributes(newValue)
        ? omit(newValue, ['cookieAttributes'])
        : newValue;

      if (
        !isDefined(valueToStore) ||
        (typeof valueToStore === 'object' &&
          Object.keys(valueToStore as object).length === 0)
      ) {
        cookieStorage.removeItem(cookieKey, cookieAttrs);
        return;
      }

      cookieStorage.setItem(
        cookieKey,
        JSON.stringify(valueToStore),
        cookieAttrs,
      );
    },
    removeItem: (_key: string): void => {
      cookieStorage.removeItem(cookieKey, defaultAttributes);
    },
  };
};

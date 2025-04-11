import omit from 'lodash.omit';
import { AtomEffect } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { cookieStorage } from '~/utils/cookie-storage';

export const localStorageEffect =
  <T>(key?: string): AtomEffect<T> =>
  ({ setSelf, onSet, node }) => {
    const savedValue = localStorage.getItem(key ?? node.key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key ?? node.key)
        : localStorage.setItem(key ?? node.key, JSON.stringify(newValue));
    });
  };

const customCookieAttributeZodSchema = z.object({
  cookieAttributes: z.object({
    expires: z.union([z.number(), z.instanceof(Date)]).optional(),
    path: z.string().optional(),
    domain: z.string().optional(),
    secure: z.boolean().optional(),
  }),
});

export const isCustomCookiesAttributesValue = (
  value: unknown,
): value is { cookieAttributes: Cookies.CookieAttributes } =>
  customCookieAttributeZodSchema.safeParse(value).success;

export const cookieStorageEffect =
  <T>(
    key: string,
    attributes?: Cookies.CookieAttributes,
    hooks?: {
      validateInitFn?: (payload: T) => boolean;
    },
  ): AtomEffect<T | null> =>
  ({ setSelf, onSet }) => {
    const savedValue = cookieStorage.getItem(key);
    if (
      isDefined(savedValue) &&
      savedValue.length !== 0 &&
      (!isDefined(hooks?.validateInitFn) ||
        hooks.validateInitFn(JSON.parse(savedValue)))
    ) {
      setSelf(JSON.parse(savedValue));
    }

    const defaultAttributes = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      ...(attributes ?? {}),
    };

    onSet((newValue, _, isReset) => {
      const cookieAttributes = {
        ...defaultAttributes,
        ...(isCustomCookiesAttributesValue(newValue)
          ? newValue.cookieAttributes
          : {}),
      };
      if (
        !newValue ||
        (Object.keys(newValue).length === 1 &&
          isCustomCookiesAttributesValue(newValue))
      ) {
        cookieStorage.removeItem(key, cookieAttributes);
        return;
      }

      isReset
        ? cookieStorage.removeItem(key, cookieAttributes)
        : cookieStorage.setItem(
            key,
            JSON.stringify(omit(newValue, ['cookieAttributes'])),
            cookieAttributes,
          );
    });
  };

export const uRLParamEffect =
  <T>(
    paramName: string,
    options?: {
      parseValue?: (value: string) => T | null;
      stringifyValue?: (value: T) => string | null;
      defaultValue?: T;
    },
  ): AtomEffect<T> =>
  ({ setSelf, onSet }) => {
    const searchParams = new URLSearchParams(window.location.search);
    const value = searchParams.get(paramName);

    if (value !== null) {
      if (options?.parseValue !== undefined) {
        const parsed = options.parseValue(value);
        if (parsed !== null) {
          setSelf(parsed);
        }
      } else {
        try {
          const parsed = JSON.parse(decodeURIComponent(value));
          setSelf(parsed as T);
        } catch (e) {
          // If parsing fails, don't set the value
        }
      }
    }

    onSet((newValue) => {
      const searchParams = new URLSearchParams(window.location.search);
      const defaultValue = options?.defaultValue;

      if (
        defaultValue !== undefined &&
        JSON.stringify(newValue) === JSON.stringify(defaultValue)
      ) {
        searchParams.delete(paramName);
      } else {
        const stringValue = options?.stringifyValue
          ? options.stringifyValue(newValue)
          : encodeURIComponent(JSON.stringify(newValue));

        if (stringValue !== null) {
          searchParams.set(paramName, stringValue);
        } else {
          searchParams.delete(paramName);
        }
      }

      const newUrl = `${window.location.pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    });
  };

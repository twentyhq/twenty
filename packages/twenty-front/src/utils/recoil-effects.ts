import { AtomEffect } from 'recoil';
import omit from 'lodash.omit';
import { z } from 'zod';

import { cookieStorage } from '~/utils/cookie-storage';

import { isDefined } from './isDefined';

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
      if (!newValue) {
        cookieStorage.removeItem(key, defaultAttributes);
        return;
      }

      const cookieAttributes = {
        ...defaultAttributes,
        ...(isCustomCookiesAttributesValue(newValue)
          ? newValue.cookieAttributes
          : {}),
      };

      isReset
        ? cookieStorage.removeItem(key, defaultAttributes)
        : cookieStorage.setItem(
            key,
            JSON.stringify(omit(newValue, ['cookieAttributes'])),
            cookieAttributes,
          );
    });
  };

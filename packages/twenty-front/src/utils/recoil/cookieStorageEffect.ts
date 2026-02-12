import omit from 'lodash.omit';
import { type AtomEffect } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { cookieStorage } from '~/utils/cookie-storage';

const customCookieAttributeZodSchema = z.object({
  cookieAttributes: z.object({
    expires: z.union([z.number(), z.instanceof(Date)]).optional(),
    path: z.string().optional(),
    domain: z.string().optional(),
    secure: z.boolean().optional(),
  }),
});

const isCustomCookiesAttributesValue = (
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
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
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

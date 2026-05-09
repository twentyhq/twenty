import { type I18n, type MessageDescriptor } from '@lingui/core';
import { isArray, isObject, isString } from '@sniptt/guards';

const USER_FRIENDLY_MESSAGE_KEY = 'userFriendlyMessage';

const isMessageDescriptor = (value: unknown): value is MessageDescriptor =>
  isObject(value) && 'id' in value && isString(value.id);

const translateValueRecursively = (
  value: unknown,
  i18n: I18n,
  parentKey?: string,
): unknown => {
  if (parentKey === USER_FRIENDLY_MESSAGE_KEY && isMessageDescriptor(value)) {
    return i18n._(value);
  }

  if (isArray(value)) {
    return value.map((item) =>
      translateValueRecursively(item, i18n, parentKey),
    );
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        translateValueRecursively(nestedValue, i18n, key),
      ]),
    );
  }

  return value;
};

export const translateUserFriendlyMessageDescriptors = (
  payload: object,
  i18n: I18n,
): Record<string, unknown> =>
  translateValueRecursively(payload, i18n) as Record<string, unknown>;

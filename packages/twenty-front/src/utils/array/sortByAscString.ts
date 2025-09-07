import { i18n } from '@lingui/core';

const collatorCache = new Map<string, Intl.Collator>();

const getCollator = (locale: string) => {
  let collator = collatorCache.get(locale);
  if (!collator) {
    collator = new Intl.Collator(locale);
    collatorCache.set(locale, collator);
  }
  return collator;
};

export const sortByAscString = (
  a: string,
  b: string,
  locale: string = i18n.locale,
): number => {
  return getCollator(locale).compare(a, b);
};

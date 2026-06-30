import { BadRequestException } from '@nestjs/common';

import { APP_LOCALES } from 'twenty-shared/translations';

// English is the source language (edited through the base labels) and pseudo-en
// is a testing pseudo-locale, so neither is a valid translation target.
export const assertTranslatableLocale = (
  locale: string,
): keyof typeof APP_LOCALES => {
  const isTranslatableLocale =
    (Object.values(APP_LOCALES) as string[]).includes(locale) &&
    locale !== APP_LOCALES.en &&
    locale !== APP_LOCALES['pseudo-en'];

  if (!isTranslatableLocale) {
    throw new BadRequestException(`Unsupported translation locale: ${locale}`);
  }

  return locale as keyof typeof APP_LOCALES;
};

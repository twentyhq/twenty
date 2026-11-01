import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { isSupportedLocale } from '@/app/translations/is-supported-locale';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const parseExtractionLocale = (
  locale?: string,
): AppLocale | undefined => {
  if (!isDefined(locale)) {
    return undefined;
  }
  if (locale === SOURCE_LOCALE || !isSupportedLocale(locale)) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: `"${locale}" is not a supported target locale.`,
      hint: `Choose one of: ${Object.keys(APP_LOCALES)
        .filter((supportedLocale) => supportedLocale !== SOURCE_LOCALE)
        .join(', ')}.`,
    });
  }
  return locale;
};

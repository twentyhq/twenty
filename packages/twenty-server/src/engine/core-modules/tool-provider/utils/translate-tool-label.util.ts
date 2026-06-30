import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';

export const translateToolLabel = (
  source: string,
  i18nService: I18nService,
  locale?: keyof typeof APP_LOCALES,
): string => {
  if (source.length === 0) {
    return source;
  }

  const messageId = generateMessageId(source);
  const translated = i18nService.translateMessage({
    messageId,
    locale: locale ?? SOURCE_LOCALE,
  });

  return translated === messageId ? source : translated;
};

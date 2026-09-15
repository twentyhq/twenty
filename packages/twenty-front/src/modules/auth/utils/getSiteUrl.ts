import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  DOCUMENTATION_SUPPORTED_LANGUAGES,
} from 'twenty-shared/constants';

const APP_SITE_HREF = 'https://twenty.com';

export const getSiteUrl = (locale: string, page: string): string => {
  const language = new Intl.Locale(locale).language;
  const isLocalizedWebsitePath =
    language !== DOCUMENTATION_DEFAULT_LANGUAGE &&
    DOCUMENTATION_SUPPORTED_LANGUAGES.includes(language);

  const url = new URL(
    isLocalizedWebsitePath ? `/${language}/${page}` : `/${page}`,
    APP_SITE_HREF,
  );

  return url.toString();
};

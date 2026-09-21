import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  DOCUMENTATION_SUPPORTED_LANGUAGES,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

const TWENTY_WEBSITE_HREF = 'https://twenty.com';

type TwentyWebsitePage = 'terms' | 'privacy-policy';

export const getTwentyWebsiteUrl = (
  locale: string,
  page: TwentyWebsitePage,
): string => {
  const language = new Intl.Locale(locale).language;

  const isLocalizedWebsitePath =
    language !== DOCUMENTATION_DEFAULT_LANGUAGE &&
    DOCUMENTATION_SUPPORTED_LANGUAGES.some(
      (supportedLanguage: DocumentationSupportedLanguage) =>
        supportedLanguage === language,
    );

  const url = new URL(
    isLocalizedWebsitePath ? `/${language}/${page}` : `/${page}`,
    TWENTY_WEBSITE_HREF,
  );

  return url.toString();
};

import {
  DOCUMENTATION_BASE_URL,
  DOCUMENTATION_DEFAULT_PATH,
  DOCUMENTATION_SUPPORTED_LANGUAGES,
  type DocumentationPath,
} from 'twenty-shared/constants';

export const getDocumentationUrl = ({
  locale,
  path = DOCUMENTATION_DEFAULT_PATH,
}: {
  locale?: string | null;
  path?: DocumentationPath | string;
}): string => {
  if (!locale) {
    return `${DOCUMENTATION_BASE_URL}${path}`;
  }

  // Extract language code from locale (e.g., 'fr' from 'fr-FR')
  const langCode = locale.split('-')[0].toLowerCase();

  const isSupported = DOCUMENTATION_SUPPORTED_LANGUAGES.includes(
    langCode as (typeof DOCUMENTATION_SUPPORTED_LANGUAGES)[number],
  );

  if (isSupported) {
    return `${DOCUMENTATION_BASE_URL}/l/${langCode}${path}`;
  }

  return `${DOCUMENTATION_BASE_URL}${path}`;
};

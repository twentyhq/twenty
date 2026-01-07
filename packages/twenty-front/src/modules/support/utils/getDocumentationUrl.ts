const DOCUMENTATION_BASE_URL = 'https://docs.twenty.com';
const DOCUMENTATION_PATH = '/user-guide/introduction';

// Locales that have documentation translations available
const SUPPORTED_DOC_LOCALES = ['fr', 'pt', 'de', 'es', 'it', 'ja', 'ko', 'zh'];

export const getDocumentationUrl = ({
  locale,
  path = DOCUMENTATION_PATH,
}: {
  locale?: string | null;
  path?: string;
}): string => {
  if (!locale) {
    return `${DOCUMENTATION_BASE_URL}${path}`;
  }

  // Extract language code from locale (e.g., 'fr' from 'fr-FR')
  const langCode = locale.split('-')[0].toLowerCase();

  if (SUPPORTED_DOC_LOCALES.includes(langCode)) {
    return `${DOCUMENTATION_BASE_URL}/l/${langCode}${path}`;
  }

  return `${DOCUMENTATION_BASE_URL}${path}`;
};

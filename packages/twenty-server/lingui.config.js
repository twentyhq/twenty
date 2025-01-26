import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fr'],
  extractorParserOptions: {
    tsExperimentalDecorators: true,
  },
  catalogs: [
    {
      path: '<rootDir>/src/engine/core-modules/i18n/locales/{locale}',
      include: ['src'],
    },
  ],
  catalogsMergePath:
    '<rootDir>/src/engine/core-modules/i18n/locales/generated/{locale}',
  ...(process.env.TRANSLATION_IO_API_KEY_BACKEND
    ? {
        service: {
          name: 'TranslationIO',
          apiKey: process.env.TRANSLATION_IO_API_KEY_BACKEND,
        },
      }
    : {}),
});

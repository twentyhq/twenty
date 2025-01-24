import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en',
  locales: [
    'en',
    'fr',
    'pt',
    'de',
    'it',
    'es',
    'zh-Hans',
    'zh-Hant',
    'pseudo-en',
  ],
  pseudoLocale: 'pseudo-en',
  fallbackLocales: {
    'pseudo-en': 'en',
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}',
      include: ['src'],
    },
  ],
  catalogsMergePath: '<rootDir>/src/locales/generated/{locale}',
  compileNamespace: 'ts',
  service: {
    name: 'TranslationIO',
    apiKey: process.env.TRANSLATION_IO_API_KEY ?? '',
  },
});

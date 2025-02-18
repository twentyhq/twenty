import { defineConfig } from '@lingui/cli';
import { APP_LOCALES } from 'twenty-shared';

export default defineConfig({
  sourceLocale: 'en',
  locales: Object.values(APP_LOCALES),
  pseudoLocale: 'pseudo-en',
  fallbackLocales: {
    'pseudo-en': 'en',
  },
  extractorParserOptions: {
    tsExperimentalDecorators: true,
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}',
      include: ['src'],
    },
  ],
  catalogsMergePath: '<rootDir>/src/locales/generated/{locale}',
  compileNamespace: 'ts',
});

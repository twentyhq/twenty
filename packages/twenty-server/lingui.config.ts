import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

export default defineConfig({
  sourceLocale: SOURCE_LOCALE,
  locales: Object.values(APP_LOCALES),
  pseudoLocale: 'pseudo-en',
  fallbackLocales: {
    'pseudo-en': 'en',
    default: SOURCE_LOCALE,
  },
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
  compileNamespace: 'ts',
  format: formatter({ lineNumbers: false, printLinguiId: true }),
});

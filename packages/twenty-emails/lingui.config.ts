import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

export default defineConfig({
  sourceLocale: 'en',
  locales: Object.values(APP_LOCALES),
  pseudoLocale: 'pseudo-en',
  fallbackLocales: {
    default: SOURCE_LOCALE,
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
  // Sort catalog entries by message id. These emails use explicit ids
  // (js-lingui-explicit-id), for which the default order is non-deterministic:
  // `lingui extract` reorders the .po on every run even with no source change,
  // so main and the Crowdin sync never agree and every i18n pull re-conflicts.
  // Sorting by messageId makes extraction idempotent and the order stable.
  orderBy: 'messageId',
  compileNamespace: 'ts',
  format: formatter({ lineNumbers: false, printLinguiId: true }),
});

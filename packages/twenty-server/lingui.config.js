import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fr'],
  extractorParserOptions: {
    tsExperimentalDecorators: true,
  },
  format: formatter({
    explicitIdAsDefault: true,
  }),
  catalogs: [
    {
      path: '<rootDir>/src/engine/core-modules/i18n/locales/{locale}',
      include: ['src'],
    },
  ],
  catalogsMergePath:
    '<rootDir>/src/engine/core-modules/i18n/locales/generated/{locale}',
  compileNamespace: 'ts',
  format: formatter({ lineNumbers: false }),
});

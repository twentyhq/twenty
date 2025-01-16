import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['fr', 'en'],
  catalogs: [
    {
      path: '<rootDir>/packages/twenty-i18n/{locale}/messages',
      include: ['src'],
    },
  ],
});

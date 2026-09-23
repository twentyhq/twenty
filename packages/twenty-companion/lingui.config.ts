import { defineConfig } from '@lingui/conf';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en'],
  catalogs: [
    {
      path: '<rootDir>/src/renderer/locales/{locale}',
      include: ['<rootDir>/src/renderer'],
      exclude: ['**/__tests__/**', '**/locales/**', '**/preview.ts'],
    },
  ],
  format: 'po',
  compileNamespace: 'ts',
});

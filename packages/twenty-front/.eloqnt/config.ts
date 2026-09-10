import { defineConfig } from '@eloqnt/cli';

export default defineConfig({
  messages: {
    path: 'src/locales',
    sourceLocale: 'en',
    format: 'po',
  },
  lint: {
    overrides: [
      {
        // Lingui's pseudo-locale (`pseudoLocale` in lingui.config.ts), not a real locale
        locales: ['pseudo-en'],
        rules: { 'invalid-locale': 'off' },
      },
    ],
  },
});

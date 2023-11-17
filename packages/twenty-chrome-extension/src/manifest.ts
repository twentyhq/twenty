import { defineManifest } from '@crxjs/vite-plugin';
import packageData from '../package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Twenty',
  description: packageData.description,
  version: packageData.version,

  icons: {
    16: 'logo/32-32.png',
    32: 'logo/32-32.png',
    48: 'logo/32-32.png',
  },

  options_page: 'options.html',

  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.ts'],
    },
  ],

  permissions: ['storage'],
});

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

  action: {},

  //TODO: change this to a documenation page
  options_page: 'options.html',

  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['https://www.linkedin.com/*'],
      js: ['src/contentScript/index.ts'],
      run_at: 'document_end',
    },
  ],

  permissions: ['activeTab', 'storage'],

  host_permissions: ['https://www.linkedin.com/*'],

  externally_connectable: {
    matches: [`https://app.twenty.com/*`, `http://localhost:3001/*`],
  },
});

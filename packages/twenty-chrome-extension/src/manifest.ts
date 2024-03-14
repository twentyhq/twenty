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

  // cannot use envoirnment variables in manifest -
  // https://github.com/facebook/create-react-app/issues/7953
  // "matches" field only accepts a https connection
  // DO NOT PUSH <all_urls> to production!
  externally_connectable: {
    matches: [`<all_urls>`],
    // matches: [`https://app.twenty.com`]
  },
});

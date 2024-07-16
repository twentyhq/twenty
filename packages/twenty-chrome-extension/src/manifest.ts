import { defineManifest } from '@crxjs/vite-plugin';

import packageData from '../package.json';

const external_sites =
  process.env.VITE_MODE === 'development'
    ? [`https://app.twenty.com/*`, `http://localhost:3001/*`]
    : [`https://app.twenty.com/*`];

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
  options_page: 'sidepanel.html',

  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['https://www.linkedin.com/*'],
      js: [
        'src/contentScript/index.ts',
        'src/contentScript/insertSettingsButton.ts',
      ],
      run_at: 'document_end',
    },
  ],

  web_accessible_resources: [
    {
      resources: ['sidepanel.html', 'page-inaccessible.html'],
      matches: ['https://www.linkedin.com/*'],
    },
  ],

  permissions: ['activeTab', 'storage', 'identity', 'sidePanel', 'cookies'],

  // setting host permissions to all http connections will allow
  // for people who host on their custom domain to get access to
  // extension instead of white listing individual urls
  host_permissions: ['https://*/*', 'http://*/*'],

  externally_connectable: {
    matches: external_sites,
  },
});

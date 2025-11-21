import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '2b308f8c-6ff8-4838-9880-aa0271dfd8d8',
  displayName: 'Rollup engine',
  description: 'Rollup engine',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: '1dc3356a-f660-4097-a161-b1686ad00c74',
      isSecret: true,
      value: '',
      description:
        'Workspace API key used by the rollup engine to call the Twenty REST API.',
    },
    TWENTY_API_BASE_URL: {
      universalIdentifier: '274c512c-a870-4651-9617-2638e0def14c',
      isSecret: false,
      value: '',
      description:
        'Optional override for the REST base URL (defaults to https://app.twenty.com/rest).',
    },
    ROLLUP_ENGINE_CONFIG: {
      universalIdentifier: 'a4672cd9-4081-43af-9d3b-5a8a55a72613',
      isSecret: false,
      value: '',
      description:
        'Optional JSON override for rollup definitions. Leave blank to use the baked-in defaults.',
    },
  },
};

export default config;

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';
import { defineApplication } from 'twenty-sdk';

export default defineApplication({
  universalIdentifier: 'ac1d2ed1-8835-4bd4-9043-28b46fdda465',
  displayName: 'Apollo enrichment',
  description: 'Data enrichment with Apollo to keep your data accurate',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  settingsCustomTabFrontComponentUniversalIdentifier: '50d59f7c-eada-4731-aacd-8e45371e1040',
  applicationVariables: {
    APOLLO_CLIENT_ID: {
      universalIdentifier: '5852219e-7757-463e-9e7c-80980203794c',
      isSecret: true,
      value: '',
      description: 'Apollo Client ID',
    },
    APOLLO_CLIENT_SECRET: {
      universalIdentifier: 'a032349d-9458-4381-8505-82547276434a',
      isSecret: true,
      value: '',
      description: 'Apollo Client Secret',
    },
    APOLLO_OAUTH_URL: {
      universalIdentifier: '1d42411c-5809-4093-873a-8121b1302475',
      isSecret: false,
      value: '',
      description: 'Apollo OAuth URL',
    },
    APOLLO_REDIRECT_URI: {
      universalIdentifier: 'c8d9e0f1-2a3b-4c5d-6e7f-8a9b0c1d2e3f',
      isSecret: false,
      value: '',
      description: 'Apollo OAuth redirect URI',
    },
    APOLLO_REGISTERED_URL: {
      universalIdentifier: '672a6fce-5565-43bc-9a3b-7f2c33620770',
      isSecret: false,
      value: '',
      description: 'Apollo registered URL',
    },
    APOLLO_ACCESS_TOKEN: {
      universalIdentifier: '672a6fce-5565-43bc-9a3b-7f2c33620771',
      isSecret: true,
      value: '',
      description: 'Apollo access token',
    },
    APOLLO_REFRESH_TOKEN: {
      universalIdentifier: '672a6fce-5565-43bc-9a3b-7f2c33620772',
      isSecret: true,
      value: '',
      description: 'Apollo refresh token',
    },
  },
});

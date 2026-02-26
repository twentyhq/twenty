import { POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/logic-functions/post-install';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';
import { defineApplication } from 'twenty-sdk';

export default defineApplication({
  universalIdentifier: 'ac1d2ed1-8835-4bd4-9043-28b46fdda465',
  displayName: 'Apollo enrichment',
  description: 'Data enrichment with Apollo to keep your data accurate',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  postInstallLogicFunctionUniversalIdentifier: POST_INSTALL_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    APOLLO_CLIENT_ID: {
      universalIdentifier: '5852219e-7757-463e-9e7c-80980203794c',
      isSecret: true,
      value: 'svSdsc2ke_N_3UhVAXjM4ayZrHZItEGHHUZpJzzDPvY',
      description: 'Apollo Client ID',
    },
    APOLLO_CLIENT_SECRET: {
      universalIdentifier: 'a032349d-9458-4381-8505-82547276434a',
      isSecret: true,
      value: 'TM26HxjXh9LwmsYqBoDqjjGN1HB8GsGQAA__gEX6EH8',
      description: 'Apollo Client Secret',
    },
    APOLLO_OAUTH_URL: {
      universalIdentifier: '1d42411c-5809-4093-873a-8121b1302475',
      isSecret: false,
      value: 'https://app.apollo.io/#/oauth/authorize',
      description: 'Apollo OAuth URL',
    },
    APOLLO_REDIRECT_URI: {
      universalIdentifier: 'c8d9e0f1-2a3b-4c5d-6e7f-8a9b0c1d2e3f',
      isSecret: false,
      value: '',
      description: 'Apollo OAuth redirect URI',
    },
  },
});

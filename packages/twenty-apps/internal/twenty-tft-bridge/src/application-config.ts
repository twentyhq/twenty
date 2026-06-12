import { defineApplication } from 'twenty-sdk/define';
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  PARTNERS_SYNC_ENDPOINT_VAR_UUID,
  SYNC_SHARED_SECRET_VAR_UUID,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    SYNC_SHARED_SECRET: {
      universalIdentifier: SYNC_SHARED_SECRET_VAR_UUID,
      description:
        'Shared HMAC-SHA256 secret. Must match SYNC_SHARED_SECRET set on the partners workspace.',
      isSecret: true,
    },
    PARTNERS_SYNC_ENDPOINT: {
      universalIdentifier: PARTNERS_SYNC_ENDPOINT_VAR_UUID,
      description:
        'Full URL of the /tft-sync httpRoute on the partners workspace.',
      isSecret: false,
    },
  },
});

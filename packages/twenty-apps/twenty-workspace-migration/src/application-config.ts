import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'Twenty',
  serverVariables: {
    TARGET_WORKSPACE_API_URL: {
      isRequired: true,
      isSecret: false,
    },
    TARGET_WORKSPACE_API_KEY: {
      isRequired: true,
      isSecret: true,
    },
    SOURCE_WORKSPACE_API_URL: {
      isRequired: true,
      isSecret: false,
    },
    SOURCE_WORKSPACE_API_KEY: {
      isRequired: true,
      isSecret: true,
    }
  }
});

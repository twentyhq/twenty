import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  SOURCE_WORKSPACE_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER, SOURCE_WORKSPACE_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
  TARGET_WORKSPACE_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER, TARGET_WORKSPACE_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  emailSupport: 'contact@twenty.com',
  websiteUrl: 'https://twenty.com',
  category: 'Other',
  author: 'Twenty',
  applicationVariables: {
    TARGET_WORKSPACE_API_URL: {
      universalIdentifier: TARGET_WORKSPACE_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
      isSecret: false,
    },
    TARGET_WORKSPACE_API_KEY: {
      universalIdentifier: TARGET_WORKSPACE_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      isSecret: true,
    },
    SOURCE_WORKSPACE_API_URL: {
      universalIdentifier: SOURCE_WORKSPACE_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
      isSecret: false,
    },
    SOURCE_WORKSPACE_API_KEY: {
      universalIdentifier: SOURCE_WORKSPACE_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      isSecret: true,
    }
  }
});

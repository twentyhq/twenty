import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
});

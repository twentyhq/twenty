import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logoUrl: 'public/logo.svg',
});

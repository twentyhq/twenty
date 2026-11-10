import { defineConnectionProvider } from 'twenty-sdk/define';

import { ACME_PROVIDER_NAME } from 'src/constants/acme';
import {
  ACME_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  IDENTIFY_ACME_ACCOUNT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: ACME_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: ACME_PROVIDER_NAME,
  displayName: 'Acme',
  type: 'apiKey',
  scope: 'USER',
  identifyAccountLogicFunction: {
    universalIdentifier: IDENTIFY_ACME_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
});

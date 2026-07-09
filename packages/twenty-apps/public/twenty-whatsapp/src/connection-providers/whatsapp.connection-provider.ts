import { defineConnectionProvider } from 'twenty-sdk/define';

import { WHATSAPP_ENVIRONMENT_VARIABLE_NAMES } from 'src/constants/environment-variable-names';
import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier:
    WHATSAPP_UNIVERSAL_IDENTIFIERS.whatsappConnectionProvider,
  name: 'whatsapp',
  displayName: 'WhatsApp',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://www.facebook.com/v23.0/dialog/oauth',
    tokenEndpoint: 'https://graph.facebook.com/v23.0/oauth/access_token',
    scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    clientIdVariable: WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.metaAppId,
    clientSecretVariable: WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.metaAppSecret,
    tokenRequestContentType: 'form-urlencoded',
  },
  messagingSettings: {
    sendMessageFunctionUniversalIdentifier:
      WHATSAPP_UNIVERSAL_IDENTIFIERS.sendWhatsappMessageFunction,
  },
});

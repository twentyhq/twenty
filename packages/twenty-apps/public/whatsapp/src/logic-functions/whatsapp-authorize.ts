import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createUnipileHostedAuthLink } from 'src/unipile/utils/create-unipile-hosted-auth-link.util';

export const whatsappAuthorizeHandler = async ({
  callbackUrl,
}: AuthorizeConnectionPayload): Promise<AuthorizeConnectionResult> => ({
  authorizationUrl: await createUnipileHostedAuthLink({
    provider: 'whatsapp',
    callbackUrl,
    config: { whatsapp: { allow_methods: ['qr'] } },
  }),
});

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-authorize',
  description:
    'Creates the Unipile hosted page showing the QR code the member scans with WhatsApp on their phone.',
  timeoutSeconds: 10,
  handler: whatsappAuthorizeHandler,
});

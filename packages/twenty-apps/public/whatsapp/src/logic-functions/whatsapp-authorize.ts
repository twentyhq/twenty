import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createUnipileHostedAuthLink } from 'src/unipile/utils/create-unipile-hosted-auth-link.util';
import { getOrCreateUnipileWorkspaceScopeId } from 'src/unipile/utils/get-or-create-unipile-workspace-scope-id.util';

export const whatsappAuthorizeHandler = async (
  { callbackUrl }: AuthorizeConnectionPayload,
  { workspaceId }: Pick<LogicFunctionExecutionContext, 'workspaceId'>,
): Promise<AuthorizeConnectionResult> => ({
  authorizationUrl: await createUnipileHostedAuthLink({
    provider: 'whatsapp',
    callbackUrl,
    accountScopeId: await getOrCreateUnipileWorkspaceScopeId(workspaceId),
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

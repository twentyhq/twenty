import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createUnipileHostedAuthLink } from 'src/unipile/utils/create-unipile-hosted-auth-link.util';

export const linkedinAuthorizeHandler = async ({
  callbackUrl,
}: AuthorizeConnectionPayload): Promise<AuthorizeConnectionResult> => ({
  authorizationUrl: await createUnipileHostedAuthLink({
    provider: 'linkedin',
    callbackUrl,
  }),
});

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-authorize',
  description:
    'Creates a Unipile hosted auth link the member signs in to LinkedIn through.',
  timeoutSeconds: 10,
  handler: linkedinAuthorizeHandler,
});

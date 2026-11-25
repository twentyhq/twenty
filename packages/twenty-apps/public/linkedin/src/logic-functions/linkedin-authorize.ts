import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_CONNECT_FLOW_TTL_MILLISECONDS } from 'src/constants/linkedin-connect-flow-ttl-milliseconds.constant';
import { LINKEDIN_CONNECT_ROUTE_PATH } from 'src/constants/linkedin-connect-route-path.constant';
import { LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';

export const linkedinAuthorizeHandler = async ({
  callbackUrl,
}: AuthorizeConnectionPayload): Promise<AuthorizeConnectionResult> => ({
  authorizationUrl: new RestApiClient().resolveUrl(
    `/s${LINKEDIN_CONNECT_ROUTE_PATH}`,
    {
      query: {
        flow: encodeLinkedinConnectFlow({
          callbackUrl,
          expiresAtMs: Date.now() + LINKEDIN_CONNECT_FLOW_TTL_MILLISECONDS,
          pendingCheckpoint: null,
        }),
      },
    },
  ),
});

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-authorize',
  description:
    'Sends the member to the page they sign in to LinkedIn on, with a signed link only this connection can use.',
  timeoutSeconds: 10,
  handler: linkedinAuthorizeHandler,
});

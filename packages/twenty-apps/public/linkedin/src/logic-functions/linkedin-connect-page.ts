import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_CONNECT_ROUTE_PATH } from 'src/constants/linkedin-connect-route-path.constant';
import { LINKEDIN_CONNECT_PAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinConnectHtmlResponse } from 'src/logic-functions/utils/build-linkedin-connect-html-response.util';
import { decodeLinkedinConnectFlow } from 'src/logic-functions/utils/decode-linkedin-connect-flow.util';
import { renderLinkedinConnectExpired } from 'src/logic-functions/utils/render-linkedin-connect-expired.util';
import { renderLinkedinConnectSignIn } from 'src/logic-functions/utils/render-linkedin-connect-sign-in.util';

export const linkedinConnectPageHandler = async ({
  queryStringParameters,
}: Pick<RoutePayload, 'queryStringParameters'>): Promise<Response> => {
  const flow = decodeLinkedinConnectFlow(queryStringParameters.flow);

  return isDefined(flow)
    ? buildLinkedinConnectHtmlResponse({
        page: renderLinkedinConnectSignIn({ flow }),
      })
    : buildLinkedinConnectHtmlResponse({
        page: renderLinkedinConnectExpired(),
        status: 400,
      });
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_CONNECT_PAGE_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-connect-page',
  description:
    'Serves the page a member signs in to LinkedIn on when connecting their account.',
  timeoutSeconds: 10,
  handler: linkedinConnectPageHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_CONNECT_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { isTeamsConnectorServiceUrl } from 'src/features/chat/logic-functions/utils/is-teams-connector-service-url';
import { normalizeTeamsServiceUrl } from 'src/features/chat/logic-functions/utils/normalize-teams-service-url';

export const requestTeamsConnector = async ({
  serviceUrl,
  path,
  method,
  accessToken,
  body,
}: {
  serviceUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken: string;
  body?: TeamsActivity;
}): Promise<string> => {
  const normalizedServiceUrl = normalizeTeamsServiceUrl(serviceUrl);

  if (!isTeamsConnectorServiceUrl(normalizedServiceUrl)) {
    throw new Error(
      `Refused to send the bot credentials to ${normalizedServiceUrl}, which is not a Bot Connector host`,
    );
  }

  const response = await fetch(`${normalizedServiceUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(isDefined(body) ? { 'content-type': 'application/json' } : {}),
    },
    ...(isDefined(body) ? { body: JSON.stringify(body) } : {}),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `Bot Connector ${method} ${path} failed: ${response.status} ${response.statusText}${isNonEmptyString(responseBody) ? ` - ${responseBody}` : ''}`,
    );
  }

  return responseBody;
};

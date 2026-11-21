import { defineLogicFunction } from 'twenty-sdk/define';
import {
  listConnections,
  type IdentifyAccountPayload,
  type IdentifyAccountResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_CONNECTION_PROVIDER_NAME } from 'src/constants/line-connection-provider-name.constant';
import { LINE_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchLineBotInfo } from 'src/logic-functions/data/fetch-line-bot-info.util';
import { LineApiError } from 'src/logic-functions/data/line-api.error';

const fetchBotInfoOrThrow = async (accessToken: string) => {
  try {
    return await fetchLineBotInfo(accessToken);
  } catch (error) {
    if (error instanceof LineApiError && error.status === 401) {
      throw new Error(
        'LINE does not accept this token. Paste the long-lived channel access token from the Messaging API tab of your channel in the LINE Developers Console.',
      );
    }

    throw error;
  }
};

// the channel secret is a single application variable, so one Official Account per workspace
const handler = async ({
  accessToken,
}: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const botInfo = await fetchBotInfoOrThrow(accessToken);
  const otherConnection = (
    await listConnections({ providerName: LINE_CONNECTION_PROVIDER_NAME })
  ).find(({ externalAccountId }) => externalAccountId !== botInfo.userId);

  if (isDefined(otherConnection)) {
    throw new Error(
      `LINE is already connected to ${otherConnection.handle}. Disconnect it before connecting another Official Account.`,
    );
  }

  return {
    externalAccountId: botInfo.userId,
    handle: `${botInfo.displayName} (${botInfo.basicId})`,
  };
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-account',
  description:
    'Checks the channel access token with LINE and names the connection after the Official Account',
  timeoutSeconds: 10,
  handler,
});

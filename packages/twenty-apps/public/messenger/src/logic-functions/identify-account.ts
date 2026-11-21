import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type IdentifyAccountPayload,
  type IdentifyAccountResult,
} from 'twenty-sdk/logic-function';

import { MESSENGER_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';

const handler = async ({
  accessToken,
}: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const systemUser = await graphApiRequest<{ id: string; name: string }>({
    accessToken,
    method: 'GET',
    path: 'me',
    query: { fields: 'id,name' },
  });
  const pages = await listMessengerPages(accessToken);

  if (pages.length === 0) {
    throw new Error(
      'This token has no Facebook Page. Assign at least one Page to the system user, then generate the token again.',
    );
  }

  return {
    externalAccountId: systemUser.id,
    handle: pages.map(({ name }) => name).join(', '),
  };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-account',
  description:
    'Checks that the system user token can manage at least one Facebook Page',
  timeoutSeconds: 10,
  handler,
});

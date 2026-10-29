import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  createMessageChannel,
  getConnection,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { PERSON_LINKEDIN_LINK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-linkedin-link-field-universal-identifier.constant';
import { LINKEDIN_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { getLinkedinUnipileAccountKey } from 'src/logic-functions/utils/get-linkedin-unipile-account-key.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';
import { getUnipileUser } from 'src/unipile/utils/get-unipile-user.util';

export const linkedinOnConnectHandler = async ({
  connectedAccountId,
}: LinkedinConnectionHookPayload): Promise<{ messageChannelId: string }> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const [existingChannel] = await listMessageChannels({ connectedAccountId });

  const channel =
    existingChannel ??
    (await (async () => {
      const profile = await getUnipileUser({
        accountId: unipileAccountId,
        userId: 'me',
      });

      return createMessageChannel({
        connectedAccountId,
        handle: buildLinkedinProfileHandle(profile),
        displayName: profile.display_name,
        visibility: 'METADATA',
        participantHandleFieldUniversalIdentifier:
          PERSON_LINKEDIN_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      });
    })());

  await kv.set(getLinkedinUnipileAccountKey(connectedAccountId), unipileAccountId);
  await kv.set(getUnipileAccountClaimKey(unipileAccountId), undefined, {
    scope: 'SERVER',
  });

  return { messageChannelId: channel.id };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-on-connect',
  description:
    'Creates the message channel of a new LinkedIn connection and routes its Unipile webhooks to this workspace.',
  timeoutSeconds: 30,
  handler: linkedinOnConnectHandler,
});

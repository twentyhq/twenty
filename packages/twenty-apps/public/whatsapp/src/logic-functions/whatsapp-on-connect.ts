import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  createMessageChannel,
  getConnection,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_CONNECT_HISTORY_IMPORT_DELAY_MILLISECONDS } from 'src/constants/whatsapp-connect-history-import-delay-milliseconds.constant';
import { PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-phones-field-universal-identifier.constant';
import {
  WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type WhatsappConnectionHookPayload } from 'src/logic-functions/types/whatsapp-connection-hook-payload.type';
import { getWhatsappChannelIdentityOrThrow } from 'src/logic-functions/utils/get-whatsapp-channel-identity-or-throw.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { restartWhatsappHistoryImport } from 'src/logic-functions/utils/restart-whatsapp-history-import.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';

export const whatsappOnConnectHandler = async ({
  connectedAccountId,
}: WhatsappConnectionHookPayload): Promise<{ messageChannelId: string }> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const [existingChannel] = await listMessageChannels({ connectedAccountId });

  const channel =
    existingChannel ??
    (await createMessageChannel({
      connectedAccountId,
      ...(await getWhatsappChannelIdentityOrThrow(unipileAccountId)),
      visibility: 'METADATA',
      participantHandleFieldUniversalIdentifier:
        PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER,
      messagingProvider: {
        universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    }));

  await kv.set(getUnipileAccountClaimKey(unipileAccountId), undefined, {
    scope: 'SERVER',
  });

  await restartWhatsappHistoryImport({
    connectedAccountId,
    settings: await getWhatsappSettings(connectedAccountId),
    delayMs: WHATSAPP_CONNECT_HISTORY_IMPORT_DELAY_MILLISECONDS,
  });

  return { messageChannelId: channel.id };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-on-connect',
  description:
    'Creates the message channel of a WhatsApp connection and imports its most recent conversations.',
  timeoutSeconds: 30,
  handler: whatsappOnConnectHandler,
});

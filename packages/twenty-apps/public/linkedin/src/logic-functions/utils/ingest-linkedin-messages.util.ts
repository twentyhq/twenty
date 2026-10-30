import {
  type AppMessageChannel,
  ingestMessages,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { resolveLinkedinParticipantPersonId } from 'src/logic-functions/utils/resolve-linkedin-participant-person-id.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

// counterparts must already carry their public identifier, so handles match the ones People are linked on
export const ingestLinkedinMessages = async ({
  connectedAccountId,
  channel,
  settings,
  counterparts,
  messages,
}: {
  connectedAccountId: string;
  channel: Pick<AppMessageChannel, 'id' | 'handle'>;
  settings: LinkedinSettings;
  counterparts: UnipileUser[];
  messages: UnipileMessage[];
}): Promise<number> => {
  const ingestableMessages = messages.filter(
    (message) => !message.is_event && !message.is_deleted,
  );

  if (ingestableMessages.length === 0) {
    return 0;
  }

  const hasUserSentMessage = ingestableMessages.some(
    (message) => message.is_sender,
  );
  const lastMessageAt = ingestableMessages
    .map((message) => message.timestamp)
    .reduce((latest, timestamp) => (timestamp > latest ? timestamp : latest));

  const personIdByHandle = new Map<string, string>();

  for (const counterpart of counterparts) {
    const personId = await resolveLinkedinParticipantPersonId({
      connectedAccountId,
      user: counterpart,
      settings,
      hasUserSentMessage,
      lastMessageAt,
    });

    if (isDefined(personId)) {
      personIdByHandle.set(buildLinkedinProfileHandle(counterpart), personId);
    }
  }

  const ingestMessagesInput = ingestableMessages
    .map((message) =>
      mapUnipileMessageToIngestMessage({
        message: {
          ...message,
          sender: message.is_sender
            ? message.sender
            : (counterparts.find(
                (counterpart) => counterpart.id === message.sender_id,
              ) ?? message.sender),
        },
        channelHandle: channel.handle,
        counterparts,
      }),
    )
    .filter(isDefined)
    .map((ingestMessage) => ({
      ...ingestMessage,
      participants: ingestMessage.participants.map((participant) => {
        const personId = personIdByHandle.get(participant.handle);

        return isDefined(personId) ? { ...participant, personId } : participant;
      }),
    }));

  for (
    let batchStart = 0;
    batchStart < ingestMessagesInput.length;
    batchStart += INGEST_MESSAGES_MAX_BATCH_SIZE
  ) {
    await ingestMessages({
      messageChannelId: channel.id,
      messages: ingestMessagesInput.slice(
        batchStart,
        batchStart + INGEST_MESSAGES_MAX_BATCH_SIZE,
      ),
    });
  }

  return ingestMessagesInput.length;
};

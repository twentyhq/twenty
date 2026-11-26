import { isDefined } from 'twenty-sdk/utils';
import {
  type IngestMessage,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';

import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { buildWhatsappParticipant } from 'src/logic-functions/utils/build-whatsapp-participant.util';
import { toWhatsappCounterparts } from 'src/logic-functions/utils/to-whatsapp-counterparts.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const buildWhatsappMessageParticipants = ({
  message,
  channelHandle,
  counterparts,
}: {
  message: UnipileMessage;
  channelHandle: string;
  counterparts: WhatsappCounterpart[];
}): IngestMessageParticipant[] | null => {
  if (message.is_sender) {
    return [
      { role: 'FROM', handle: channelHandle },
      ...counterparts.map((counterpart) =>
        buildWhatsappParticipant({ role: 'TO', counterpart }),
      ),
    ];
  }

  const sender =
    counterparts.find(({ user }) => user.id === message.sender_id) ??
    toWhatsappCounterparts([
      message.sender ?? { id: message.sender_id, display_name: '' },
    ])[0];

  if (!isDefined(sender)) {
    return null;
  }

  return [
    buildWhatsappParticipant({ role: 'FROM', counterpart: sender }),
    { role: 'TO', handle: channelHandle },
    ...counterparts
      .filter(({ handle }) => handle !== sender.handle)
      .map((counterpart) =>
        buildWhatsappParticipant({ role: 'TO', counterpart }),
      ),
  ];
};

export const mapUnipileMessageToIngestMessage = ({
  message,
  channelHandle,
  counterparts,
}: {
  message: UnipileMessage;
  channelHandle: string;
  counterparts: WhatsappCounterpart[];
}): IngestMessage | null => {
  if (message.is_event || message.is_deleted) {
    return null;
  }

  const participants = buildWhatsappMessageParticipants({
    message,
    channelHandle,
    counterparts,
  });

  if (!isDefined(participants)) {
    return null;
  }

  return {
    externalId: message.id,
    threadExternalId: message.chat_id,
    text: message.text ?? '',
    receivedAt: new Date(message.timestamp),
    participants,
  };
};

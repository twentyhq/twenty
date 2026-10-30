import { isDefined } from 'twenty-sdk/utils';
import {
  type IngestMessage,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';

import { buildLinkedinParticipant } from 'src/logic-functions/utils/build-linkedin-participant.util';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const buildLinkedinMessageParticipants = ({
  message,
  channelHandle,
  counterparts,
}: {
  message: UnipileMessage;
  channelHandle: string;
  counterparts: UnipileUser[];
}): IngestMessageParticipant[] => {
  if (message.is_sender) {
    return [
      { role: 'FROM', handle: channelHandle },
      ...counterparts.map((user) =>
        buildLinkedinParticipant({ role: 'TO', user }),
      ),
    ];
  }

  const sender: IngestMessageParticipant = isDefined(message.sender)
    ? buildLinkedinParticipant({ role: 'FROM', user: message.sender })
    : {
        role: 'FROM',
        handle: buildLinkedinProfileHandle({ id: message.sender_id }),
      };

  return [sender, { role: 'TO', handle: channelHandle }];
};

export const mapUnipileMessageToIngestMessage = ({
  message,
  channelHandle,
  counterparts,
}: {
  message: UnipileMessage;
  channelHandle: string;
  counterparts: UnipileUser[];
}): IngestMessage | null => {
  if (message.is_event || message.is_deleted) {
    return null;
  }

  return {
    externalId: message.id,
    threadExternalId: message.chat_id,
    text: message.text ?? '',
    receivedAt: new Date(message.timestamp),
    participants: buildLinkedinMessageParticipants({
      message,
      channelHandle,
      counterparts,
    }),
  };
};

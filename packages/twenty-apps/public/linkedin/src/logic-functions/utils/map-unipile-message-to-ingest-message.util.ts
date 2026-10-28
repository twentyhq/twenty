import { isDefined } from 'twenty-sdk/utils';
import {
  type IngestMessage,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';

import { buildLinkedinParticipant } from 'src/logic-functions/utils/build-linkedin-participant.util';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

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

  const channelParticipant = (
    role: IngestMessageParticipant['role'],
  ): IngestMessageParticipant => ({ role, handle: channelHandle });

  const participants: IngestMessageParticipant[] = message.is_sender
    ? [
        channelParticipant('FROM'),
        ...counterparts.map((user) =>
          buildLinkedinParticipant({ role: 'TO', user }),
        ),
      ]
    : [
        isDefined(message.sender)
          ? buildLinkedinParticipant({ role: 'FROM', user: message.sender })
          : {
              role: 'FROM',
              handle: buildLinkedinProfileHandle({ id: message.sender_id }),
            },
        channelParticipant('TO'),
      ];

  return {
    externalId: message.id,
    threadExternalId: message.chat_id,
    text: message.text ?? '',
    receivedAt: new Date(message.timestamp),
    participants,
  };
};

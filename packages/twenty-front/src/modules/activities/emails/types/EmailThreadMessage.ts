import { type MessageDeliveryStatus } from 'twenty-shared/types';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { type MessageReaction } from '@/activities/emails/types/MessageReaction';
import { type MessageThread } from '@/activities/emails/types/MessageThread';

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string | null;
  subject: string;
  headerMessageId: string;
  messageThreadId: string;
  messageParticipants: EmailThreadMessageParticipant[];
  messageChannelMessageAssociations?: Pick<
    MessageChannelMessageAssociation,
    'id' | 'messageChannelId' | 'direction'
  >[];
  messageThread: MessageThread;
  isDraft: boolean;
  deliveryStatus?: MessageDeliveryStatus | null;
  attachments?: Pick<Attachment, 'id' | 'file'>[];
  reactions?: MessageReaction[];
  __typename: 'EmailThreadMessage';
};

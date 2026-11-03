import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { type MessageThread } from '@/activities/emails/types/MessageThread';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

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
  attachments?: FieldFilesValue[] | null;
  __typename: 'EmailThreadMessage';
};

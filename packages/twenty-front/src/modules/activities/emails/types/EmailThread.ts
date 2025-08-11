import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';

export type EmailThread = {
  id: string;
  subject: string;
  messages: EmailThreadMessage[];
  __typename: 'EmailThread';
};

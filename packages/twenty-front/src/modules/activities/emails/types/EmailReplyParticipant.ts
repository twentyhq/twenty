import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export type EmailReplyParticipant = Pick<
  EmailThreadMessageParticipant,
  'role' | 'handle' | 'displayName'
>;

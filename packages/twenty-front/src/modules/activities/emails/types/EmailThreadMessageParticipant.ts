import { EmailParticipantRole } from '@/activities/emails/types/EmailParticipantRole';
import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type EmailThreadMessageParticipant = {
  displayName: string;
  handle: string;
  role: EmailParticipantRole;
  person: Person;
  workspaceMember: WorkspaceMember;
};

import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type EmailThreadMessageParticipant = {
  displayName: string;
  handle: string;
  role: string;
  person: Person;
  workspaceMember: WorkspaceMember;
};

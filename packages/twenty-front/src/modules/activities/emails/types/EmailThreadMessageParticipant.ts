import { type Person } from '@/people/types/Person';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { type MessageParticipantRole } from 'twenty-shared/types';

export type EmailThreadMessageParticipant = {
  id: string;
  displayName: string;
  handle: string;
  role: MessageParticipantRole;
  messageId: string;
  person: Person;
  workspaceMember: WorkspaceMember;
  __typename: 'EmailThreadMessageParticipant';
};

import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '~/generated-metadata/graphql';

export type CalendarEventParticipant = {
  id: string;
  handle: string;
  isOrganizer: boolean;
  displayName: string;
  person?: Person;
  workspaceMember?: WorkspaceMember;
  responseStatus: 'ACCEPTED' | 'DECLINED' | 'NEEDS_ACTION' | 'TENTATIVE';
};

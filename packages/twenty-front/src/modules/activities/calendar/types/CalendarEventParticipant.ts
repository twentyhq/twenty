import { type Person } from '@/people/types/Person';
import { type WorkspaceMember } from '~/generated-metadata/graphql';

export type CalendarEventParticipant = {
  id: string;
  applicationId?: string | null;
  handle: string;
  isOrganizer: boolean;
  displayName: string;
  person?: Person;
  workspaceMember?: WorkspaceMember;
  responseStatus: 'ACCEPTED' | 'DECLINED' | 'NEEDS_ACTION' | 'TENTATIVE';
};

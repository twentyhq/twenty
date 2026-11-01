import { type FullNameNode } from 'src/front-components/types/full-name-node.type';

export type CallParticipantNode = {
  id: string;
  handle?: string | null;
  displayName?: string | null;
  isOrganizer?: boolean | null;
  personId?: string | null;
  workspaceMemberId?: string | null;
  person?: {
    id: string;
    name?: FullNameNode | null;
    avatarUrl?: string | null;
    avatarFile?: Array<{ url?: string | null }> | null;
  } | null;
  workspaceMember?: {
    id: string;
    name?: FullNameNode | null;
    avatarUrl?: string | null;
  } | null;
};

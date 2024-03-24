import { WorkspaceMember } from '~/generated/graphql';

export type Event = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  opportunityId: string | null;
  companyId: string;
  personId: string;
  workspaceMemberId: string;
  workspaceMember: WorkspaceMember;
  properties: any;
  name: string;
};

import { WorkspaceMember } from '~/generated/graphql';

export type TimelineEvent = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  opportunityId: string | null;
  companyId: string | null;
  personId: string | null;
  workspaceMemberId: string;
  workspaceMember: WorkspaceMember;
  properties: any;
  name: string;
};

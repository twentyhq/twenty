export type Event = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  opportunityId: string | null;
  companyId: string;
  personId: string;
  workspaceMemberId: string;
  properties: any;
  name: string;
};

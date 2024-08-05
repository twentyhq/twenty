import { WorkspaceMember } from '~/generated/graphql';

export type TimelineActivity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  workspaceMemberId: string;
  workspaceMember: WorkspaceMember;
  properties: any;
  name: string;
  linkedRecordCachedName: string;
  linkedRecordId: string;
  linkedObjectMetadataId: string;
  __typename: 'TimelineActivity';
} & Record<string, any>;

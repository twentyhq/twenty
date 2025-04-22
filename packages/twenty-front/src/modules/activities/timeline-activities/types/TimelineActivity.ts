import { isDefined } from 'twenty-shared/utils';
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
  linkedRecordId: string | null;
  linkedObjectMetadataId: string | null;
  __typename: 'TimelineActivity';
} & Record<string, any>;

export type TimelineActivityWithRecord = TimelineActivity & {
  linkedRecordId: string;
  linkedObjectMetadataId: string;
};

export const isTimelineActivityWithRecord = (
  el: TimelineActivity,
): el is TimelineActivityWithRecord =>
  isDefined(el.linkedObjectMetadataId) && isDefined(el.linkedRecordId);

import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceMember } from '~/generated/graphql';

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

export const isTimelineActivityWithLinkedRecord = (
  timelineActivity: TimelineActivity,
): timelineActivity is TimelineActivityWithRecord =>
  isDefined(timelineActivity.linkedObjectMetadataId) &&
  isDefined(timelineActivity.linkedRecordId);

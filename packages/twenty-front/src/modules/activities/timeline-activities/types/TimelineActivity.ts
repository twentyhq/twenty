import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceMember } from '~/generated-metadata/graphql';

export type TimelineActivity = {
  id: string;
  createdAt: string;
  happensAt: string;
  updatedAt: string;
  deletedAt: string | null;
  workspaceMemberId: string;
  workspaceMember: WorkspaceMember;
  properties: Record<string, unknown> & {
    diff?: Record<string, { before: unknown; after: unknown }>;
  };
  name: string | null;
  timelineActivityTypeId: string | null;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot | null;
  linkedRecordId: string | null;
  linkedObjectMetadataId: string | null;
  __typename: 'TimelineActivity';
} & Record<string, unknown>;

export type TimelineActivityWithLinkedRecord = TimelineActivity & {
  linkedRecordId: string;
  linkedObjectMetadataId: string;
};

export const isTimelineActivityWithLinkedRecord = (
  timelineActivity: TimelineActivity,
): timelineActivity is TimelineActivityWithLinkedRecord =>
  isDefined(timelineActivity.linkedObjectMetadataId) &&
  isDefined(timelineActivity.linkedRecordId);

import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type AccountBriefActivity } from 'src/logic-functions/domain/account-brief-activity.type';
import { BRIEF_ACTIVITY_WINDOW_DAYS } from 'src/logic-functions/constants/brief-sweep.constants';

type TimelineActivityNode = {
  id: string;
  name: string;
  happensAt: string;
  properties: unknown;
};

type TimelineActivityQueryResult = {
  timelineActivities?: {
    edges?: { node: TimelineActivityNode | null }[] | null;
  } | null;
};

// Timeline activities link to any record via linkedRecordId; they cover
// emails, calendar events, notes, tasks and workflow runs in one stream.
export const fetchRecentTimelineActivities = async ({
  client,
  recordId,
  now,
}: {
  client: CoreApiClient;
  recordId: string;
  now: Date;
}): Promise<AccountBriefActivity[]> => {
  const windowStart = new Date(
    now.getTime() - BRIEF_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const queryResult = (await client.query({
    timelineActivities: {
      __args: {
        filter: {
          linkedRecordId: { eq: recordId },
          happensAt: { gte: windowStart.toISOString() },
        },
        orderBy: [{ happensAt: 'AscNullsLast' }],
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          happensAt: true,
          properties: true,
        },
      },
    },
  })) as TimelineActivityQueryResult;

  return (queryResult.timelineActivities?.edges ?? [])
    .map((edge) => edge?.node)
    .filter(
      (node): node is TimelineActivityNode =>
        Boolean(node && !isUndefined(node.id)),
    );
};

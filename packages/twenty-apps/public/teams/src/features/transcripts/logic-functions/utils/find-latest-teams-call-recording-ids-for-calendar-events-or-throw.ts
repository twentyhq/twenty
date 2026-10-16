import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

export const findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow = async ({
  coreApiClient,
  calendarEventIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  calendarEventIds: string[];
}): Promise<string[]> => {
  const applicationId = process.env.APPLICATION_ID;

  if (!isNonEmptyString(applicationId)) {
    return [];
  }

  const latestCallRecordingIds: string[] = [];

  for (const calendarEventId of calendarEventIds) {
    const queryResult: {
      callRecordings?: { edges?: { node: { id: string } }[] };
    } = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: {
            calendarEventId: { eq: calendarEventId },
            applicationId: { eq: applicationId },
          },
          orderBy: [{ startedAt: 'DescNullsLast' }],
          first: 1,
        },
        edges: { node: { id: true } },
      },
    });
    const latestCallRecordingId =
      queryResult.callRecordings?.edges?.[0]?.node.id;

    if (isDefined(latestCallRecordingId)) {
      latestCallRecordingIds.push(latestCallRecordingId);
    }
  }

  return [...new Set(latestCallRecordingIds)];
};

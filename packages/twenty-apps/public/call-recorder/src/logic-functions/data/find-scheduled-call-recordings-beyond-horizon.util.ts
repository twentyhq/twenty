import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { computeUpcomingCalendarEventHorizonEnd } from 'src/logic-functions/domain/compute-upcoming-calendar-event-horizon-end.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type BeyondHorizonCallRecordingNode = {
  id: string;
  externalBotId?: string | null;
  calendarEvent?: { startsAt?: string | null } | null;
};

// Open scheduled recordings whose meeting starts past the horizon. A pre-horizon
// run could schedule these speculatively; the meeting start (not createdAt) decides.
export const findScheduledCallRecordingsBeyondHorizon = async (
  client: CoreApiClient,
  now: Date,
): Promise<CallRecordingRecord[]> => {
  const horizonEndMs = computeUpcomingCalendarEventHorizonEnd(now).getTime();

  const candidateNodes = await fetchAllNodes<BeyondHorizonCallRecordingNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
              status: { eq: CallRecordingStatus.SCHEDULED },
              recordingRequestStatus: {
                eq: CallRecordingRequestStatus.REQUESTED,
              },
            },
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
          edges: {
            node: {
              id: true,
              externalBotId: true,
              calendarEvent: {
                startsAt: true,
              },
            },
          },
        },
      });

      return (queryResult.callRecordings ?? undefined) as
        | ConnectionPage<BeyondHorizonCallRecordingNode>
        | undefined;
    },
  );

  return candidateNodes
    .filter((node) => isBeyondHorizon(node.calendarEvent?.startsAt, horizonEndMs))
    .map((node) => ({
      id: node.id,
      status: CallRecordingStatus.SCHEDULED,
      recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
      externalBotId: isNonEmptyString(node.externalBotId)
        ? node.externalBotId
        : undefined,
    }));
};

// An unknown start time is not proof the meeting is beyond the horizon, so it is spared.
const isBeyondHorizon = (
  startsAt: string | null | undefined,
  horizonEndMs: number,
): boolean =>
  isNonEmptyString(startsAt) && new Date(startsAt).getTime() > horizonEndMs;

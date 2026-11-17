import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { type CanceledCallRecordingBot } from 'src/logic-functions/types/canceled-call-recording-bot.type';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

type CanceledCallRecordingNode = {
  id: string;
  externalBotId?: string | null;
  calendarEvent?: { startsAt?: string | null; endsAt?: string | null } | null;
};

export const findCanceledCallRecordingsWithBot = async (
  client: Pick<CoreApiClient, 'query'>,
): Promise<CanceledCallRecordingBot[]> => {
  const canceledCallRecordingNodes =
    await fetchAllNodes<CanceledCallRecordingNode>(async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
              recordingRequestStatus: {
                eq: CallRecordingRequestStatus.CANCELED,
              },
              status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
              externalBotId: { is: 'NOT_NULL' },
            },
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: { hasNextPage: true, endCursor: true },
          edges: {
            node: {
              id: true,
              externalBotId: true,
              calendarEvent: { startsAt: true, endsAt: true },
            },
          },
        },
      });

      return queryResult.callRecordings as
        | ConnectionPage<CanceledCallRecordingNode>
        | undefined;
    });

  return canceledCallRecordingNodes.flatMap((canceledCallRecordingNode) => {
    const externalBotId = normalizeOptionalString(
      canceledCallRecordingNode.externalBotId,
    );

    if (isUndefined(externalBotId)) {
      return [];
    }

    return [
      {
        callRecordingId: canceledCallRecordingNode.id,
        externalBotId,
        meetingStartsAt: normalizeOptionalString(
          canceledCallRecordingNode.calendarEvent?.startsAt,
        ),
        meetingEndsAt: normalizeOptionalString(
          canceledCallRecordingNode.calendarEvent?.endsAt,
        ),
      },
    ];
  });
};

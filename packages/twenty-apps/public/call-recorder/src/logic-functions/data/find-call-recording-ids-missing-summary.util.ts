import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { CALL_RECORDER_CREATED_BY_SOURCE } from 'src/logic-functions/constants/call-recorder-created-by-source';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/build-call-recording-summary-prompt.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingSummaryStateNode = {
  id: string;
  createdAt?: string | null;
  transcript?: unknown;
  summary?: { markdown?: string | null } | null;
};

export const findCallRecordingIdsMissingSummary = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const callRecordingNodes = await fetchAllNodes<CallRecordingSummaryStateNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
              status: { eq: CallRecordingStatus.COMPLETED },
              transcript: { is: 'NOT_NULL' },
              // Never sweep recordings another app or a user created — agent
              // runs are billed, so the unattended path only spends on ours.
              createdBy: {
                source: { eq: CALL_RECORDER_CREATED_BY_SOURCE },
                name: { eq: APP_DISPLAY_NAME },
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
              createdAt: true,
              transcript: true,
              summary: { markdown: true },
            },
          },
        },
      });

      return queryResult.callRecordings as
        | ConnectionPage<CallRecordingSummaryStateNode>
        | undefined;
    },
  );

  return callRecordingNodes
    .filter(
      (callRecording) =>
        isUndefined(getString(callRecording.summary?.markdown)) &&
        buildCallRecordingSummaryPrompt({
          transcript: callRecording.transcript,
        }) !== undefined,
    )
    .sort((left, right) =>
      (right.createdAt ?? '').localeCompare(left.createdAt ?? ''),
    )
    .map((callRecording) => callRecording.id);
};

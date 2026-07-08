import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { CALL_RECORDER_CREATED_BY_SOURCE } from 'src/logic-functions/constants/call-recorder-created-by-source';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  type ConnectionPage,
  fetchAllNodes,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingApplicationIdNode = {
  id: string;
  applicationId?: string | null;
};

export type BackfillCallRecordingApplicationIdsResult = {
  scanned: number;
  updated: number;
};

// One-time provenance backfill: stamp this app's universal identifier onto the
// call recordings it created before the field was populated at creation time.
// Ownership is inferred from the actor the platform stamps, since legacy rows
// have no applicationId yet.
export const backfillCallRecordingApplicationIds = async (
  client: CoreApiClient,
): Promise<BackfillCallRecordingApplicationIdsResult> => {
  const callRecordingNodes =
    await fetchAllNodes<CallRecordingApplicationIdNode>(async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
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
              applicationId: true,
            },
          },
        },
      });

      return queryResult.callRecordings as
        | ConnectionPage<CallRecordingApplicationIdNode>
        | undefined;
    });

  const callRecordingIdsMissingApplicationId = callRecordingNodes
    .filter((callRecording) => isUndefined(getString(callRecording.applicationId)))
    .map((callRecording) => callRecording.id);

  for (const id of callRecordingIdsMissingApplicationId) {
    await updateCallRecording(client, {
      id,
      data: { applicationId: APPLICATION_UNIVERSAL_IDENTIFIER },
    });
  }

  return {
    scanned: callRecordingNodes.length,
    updated: callRecordingIdsMissingApplicationId.length,
  };
};

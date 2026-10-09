import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { CALL_RECORDING_MEDIA_STATE_NODE_SELECTION } from 'src/constants/call-recording-media-state-node-selection.constant';
import { callRecordingMediaStateQueryResultSchema } from 'src/logic-functions/schemas/call-recording-media-state-query-result.schema';
import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { mapCallRecordingMediaState } from 'src/logic-functions/utils/map-call-recording-media-state.util';

export const findCallRecordingMediaState = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<CallRecordingMediaState | undefined> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: { node: CALL_RECORDING_MEDIA_STATE_NODE_SELECTION },
    },
  });
  const parsedQueryResult =
    callRecordingMediaStateQueryResultSchema.parse(queryResult);
  const node = parsedQueryResult.callRecordings?.edges[0]?.node;

  if (!isDefined(node)) {
    return undefined;
  }

  return mapCallRecordingMediaState(node);
};

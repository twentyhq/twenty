import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_FOR_ARTIFACTS_IMPORT_SELECTION } from 'src/logic-functions/constants/call-recording-for-artifacts-import-selection';
import { parseCallRecordingForArtifactsImportNode } from 'src/logic-functions/data/parse-call-recording-for-artifacts-import-node.util';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/types/call-recording-for-artifacts-import.type';

export const findCallRecordingForArtifactsImport = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<CallRecordingForArtifactsImport | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: CALL_RECORDING_FOR_ARTIFACTS_IMPORT_SELECTION,
      },
    },
  });

  return parseCallRecordingForArtifactsImportNode(
    queryResult.callRecordings?.edges?.[0]?.node,
  );
};

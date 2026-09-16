import { type CoreApiClient } from 'twenty-client-sdk/core';

import { ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE } from 'src/logic-functions/constants/artifacts-import-claim-field-by-scope';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateClaimedCallRecordingArtifacts = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scope,
    claimedAt,
    data,
  }: {
    callRecordingId: string;
    scope: CallRecordingArtifactImportScope;
    claimedAt: string;
    data: CallRecordingUpdateFields;
  },
): Promise<void> => {
  if (!hasCallRecordingUpdateFields(data)) {
    return;
  }

  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { eq: CallRecordingStatus.PROCESSING },
          [ARTIFACTS_IMPORT_CLAIM_FIELD_BY_SCOPE[scope]]: { eq: claimedAt },
        },
        data,
      },
      id: true,
    },
  });

  if ((result.updateCallRecordings ?? []).length === 0) {
    throw new Error(
      `Artifact import claim for ${callRecordingId} is no longer active`,
    );
  }
};

import { enqueueJobs } from 'twenty-sdk/logic-function';

import { FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomGenerateCallRecordingTitlePayload } from 'src/logic-functions/schemas/fathom-generate-call-recording-title-payload.schema';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const enqueueFathomCallRecordingTitleGeneration = async (
  payload: FathomGenerateCallRecordingTitlePayload,
): Promise<void> => {
  try {
    const result = await enqueueJobs({
      logicFunctionUniversalIdentifier:
        FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER,
      payloads: [payload],
      retryLimit: 0,
    });

    if (!result.enqueued) {
      console.warn(
        `Could not queue a title for Fathom call recording ${payload.callRecordingId}`,
      );
    }
  } catch (error) {
    console.warn(
      `Could not queue a title for Fathom call recording ${payload.callRecordingId}`,
      toErrorMessage(error),
    );
  }
};

import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomGenerateCallRecordingTitlePayload } from 'src/logic-functions/schemas/fathom-generate-call-recording-title-payload.schema';
import { generateFathomCallRecordingTitle } from 'src/logic-functions/utils/generate-fathom-call-recording-title.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const renameFathomCallRecording = async ({
  coreApiClient,
  payload,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  payload: FathomGenerateCallRecordingTitlePayload;
}): Promise<{ renamed: boolean }> => {
  const filter = {
    id: { eq: payload.callRecordingId },
    title: { eq: payload.expectedTitle },
  };

  try {
    const existingRecord = await coreApiClient.query({
      callRecordings: {
        __args: { filter, first: 1 },
        edges: { node: { id: true } },
      },
    });

    if (!isNonEmptyArray(existingRecord.callRecordings?.edges)) {
      return { renamed: false };
    }

    const title = await generateFathomCallRecordingTitle(payload);

    if (!isNonEmptyString(title)) {
      return { renamed: false };
    }

    const result = await coreApiClient.mutation({
      updateCallRecordings: {
        __args: { filter, data: { title } },
        id: true,
      },
    });

    return { renamed: isNonEmptyArray(result.updateCallRecordings) };
  } catch (error) {
    console.warn(
      `Could not rename Fathom call recording ${payload.callRecordingId}`,
      toErrorMessage(error),
    );

    return { renamed: false };
  }
};

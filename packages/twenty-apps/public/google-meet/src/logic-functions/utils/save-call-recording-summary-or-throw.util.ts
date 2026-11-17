import { type CoreApiClient } from 'twenty-client-sdk/core';

export const saveCallRecordingSummaryOrThrow = async ({
  coreApiClient,
  callRecordingId,
  summaryMarkdown,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  summaryMarkdown: string;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecording: {
      __args: {
        id: callRecordingId,
        data: { summary: { blocknote: null, markdown: summaryMarkdown } },
      },
      id: true,
    },
  });
};

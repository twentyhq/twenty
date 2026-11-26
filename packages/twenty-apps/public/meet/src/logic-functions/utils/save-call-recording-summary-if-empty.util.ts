import { type CoreApiClient } from 'twenty-client-sdk/core';

export const saveCallRecordingSummaryIfEmpty = async ({
  coreApiClient,
  callRecordingId,
  summaryMarkdown,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  summaryMarkdown: string;
}): Promise<boolean> => {
  const mutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          or: [
            { summary: { markdown: { is: 'NULL' as const } } },
            { summary: { markdown: { eq: '' } } },
          ],
        },
        data: { summary: { blocknote: null, markdown: summaryMarkdown } },
      },
      id: true,
    },
  });

  return (mutationResult.updateCallRecordings ?? []).length > 0;
};

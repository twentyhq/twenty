import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_SUMMARY_PENDING_MARKDOWN } from 'src/logic-functions/constants/call-recording-summary-pending-markdown';

// The conditional update prevents duplicate agent runs and AI credit spend.
export const claimCallRecordingSummary = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          summary: { markdown: { is: 'NULL' } },
        },
        data: {
          summary: { markdown: CALL_RECORDING_SUMMARY_PENDING_MARKDOWN },
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};

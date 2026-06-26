import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_SUMMARY_PENDING_MARKDOWN } from 'src/logic-functions/constants/call-recording-summary-pending-markdown';

// Atomically claims summary generation: writes the pending marker only when the
// summary is still empty. Mirrors completeCallRecordingIngestion — the single
// winner of the conditional update proceeds, everyone else gets `false`.
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

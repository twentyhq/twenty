import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

export const recoverRecordingCharges = async (
  client: CoreApiClient,
  now: Date,
): Promise<void> => {
  const staleBefore = new Date(now.getTime() - 5 * 60_000).toISOString();
  const result = await client.query({
    callRecordings: {
      __args: {
        first: 5,
        orderBy: [{ updatedAt: 'AscNullsFirst' }],
        filter: {
          status: { eq: 'COMPLETED' },
          companionBillingState: { like: '%PENDING%' },
          updatedAt: { lt: staleBefore },
        },
      },
      edges: { node: { id: true, companionBillingState: true } },
    },
  });
  for (const { node } of result.callRecordings?.edges ?? []) {
    if (!node || asRecord(node.companionBillingState)?.status !== 'PENDING')
      continue;
    try {
      const claimed = await client.mutation({
        updateCallRecordings: {
          __args: {
            filter: { id: { eq: node.id }, updatedAt: { lt: staleBefore } },
            data: { updatedAt: now.toISOString() },
          },
          id: true,
        },
      });
      if (!claimed.updateCallRecordings?.length) continue;
      await chargeCompletedCallRecording(client, { callRecordingId: node.id });
    } catch (error) {
      console.warn(
        `[companion] recording charge remains pending for ${node.id}`,
        error,
      );
    }
  }
};

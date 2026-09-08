import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';

import { asRecord } from 'src/logic-functions/utils/as-record.util';

const SUMMARY_RECOVERY_CURSOR_KEY = 'companion-summary-recovery-cursor';

export const recoverRecordingSummaries = async (
  client: CoreApiClient,
  now: Date,
): Promise<void> => {
  const staleBefore = new Date(now.getTime() - 5 * 60_000).toISOString();
  const cursor = await kv.get(SUMMARY_RECOVERY_CURSOR_KEY);
  const missingSummary = {
    or: [
      { summary: { markdown: { is: 'NULL' as const } } },
      { summary: { markdown: { eq: '' } } },
    ],
  };
  const result = await client.query({
    callRecordings: {
      __args: {
        first: 20,
        ...(typeof cursor === 'string' && cursor ? { after: cursor } : {}),
        orderBy: [{ createdAt: 'AscNullsFirst' }],
        filter: {
          ...missingSummary,
          status: { eq: 'COMPLETED' },
          createdAt: { lt: staleBefore },
        },
      },
      edges: { node: { id: true } },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
  for (const { node } of result.callRecordings?.edges ?? []) {
    if (!node) continue;
    try {
      // Only recover paid results; maintenance must not start new paid generations.
      const cached = asRecord(
        await kv.get(`companion-summary:${node.id}:automatic`),
      );
      if (cached?.status !== 'READY' || typeof cached.markdown !== 'string')
        continue;
      await client.mutation({
        updateCallRecordings: {
          __args: {
            filter: { id: { eq: node.id }, ...missingSummary },
            data: { summary: { blocknote: null, markdown: cached.markdown } },
          },
          id: true,
        },
      });
    } catch (error) {
      console.warn(
        `[companion] summary save remains pending for ${node.id}`,
        error,
      );
    }
  }
  // Advance independently of recording writes so older rows cannot starve recovery.
  const pageInfo = result.callRecordings?.pageInfo;
  await kv.set(
    SUMMARY_RECOVERY_CURSOR_KEY,
    pageInfo?.hasNextPage ? (pageInfo.endCursor ?? null) : null,
  );
};

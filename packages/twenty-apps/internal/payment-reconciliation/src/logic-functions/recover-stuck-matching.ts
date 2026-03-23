import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { RECOVER_STUCK_MATCHING_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';

const STUCK_THRESHOLD_MINUTES = 30;

const handler = async () => {
  const client = new CoreApiClient();

  const cutoff = new Date(
    Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000,
  ).toISOString();

  // Find source files stuck in MATCHING for longer than the threshold
  const { payReconSourceFiles: result } = (await client.query({
    payReconSourceFiles: {
      __args: {
        filter: {
          and: [
            { parseStatus: { eq: 'MATCHING' } },
            { updatedAt: { lt: cutoff } },
          ],
        },
        first: 50,
      },
      edges: { node: { id: true, name: true, updatedAt: true } },
    },
  })) as unknown as {
    payReconSourceFiles: {
      edges: { node: { id: string; name: string; updatedAt: string } }[];
    };
  };

  const stuck = result.edges.map((e) => e.node);

  if (stuck.length === 0) {
    return { recovered: 0 };
  }

  console.log(
    `[recover-stuck-matching] Found ${stuck.length} source file(s) stuck in MATCHING`,
  );

  for (const sf of stuck) {
    const stuckMinutes = Math.round(
      (Date.now() - new Date(sf.updatedAt).getTime()) / 60000,
    );

    await client.mutation({
      updatePayReconSourceFile: {
        __args: {
          id: sf.id,
          data: {
            parseStatus: 'FAILED',
            parseError: `Matching timed out after ${stuckMinutes} minutes (auto-recovered)`,
          },
        },
        id: true,
      },
    });

    console.log(
      `[recover-stuck-matching] Marked "${sf.name}" (${sf.id}) as FAILED — stuck for ${stuckMinutes}m`,
    );
  }

  return { recovered: stuck.length };
};

export default defineLogicFunction({
  universalIdentifier: RECOVER_STUCK_MATCHING_LOGIC_FUNCTION_ID,
  name: 'recover-stuck-matching',
  description:
    'Cron job that marks source files stuck in MATCHING for >30 minutes as FAILED',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
